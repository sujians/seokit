import { defineTool, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { isIP } from "node:net";
import { domainToASCII } from "node:url";
import { Type } from "typebox";
import { EnvHttpProxyAgent, fetch, type Dispatcher } from "undici";
import { analysisResult, objectOutput, type JsonValue } from "../tools/result.js";

const apiOrigin = "https://api.dataforseo.com/v3/";
const usdMicros = 1_000_000;
const confirmationThreshold = 500_000;
const credentialNames = ["DATAFORSEO_LOGIN", "DATAFORSEO_PASSWORD"] as const;
const fallback = ["Use public web search and seokit_fetch_page for competitor research.", "Import supplied keyword metrics from CSV with seokit_read_keyword_csv."];
const pricing = {
  "keywords_data/google_ads/search_volume/live": "https://dataforseo.com/pricing/keywords-data/google-ads",
  "serp/google/organic/live/regular": "https://dataforseo.com/pricing/google-serp/google-organic-serp-api",
  "backlinks/summary/live": "https://dataforseo.com/pricing/backlinks/backlinks",
};
type Endpoint = keyof typeof pricing;
type ApiObject = Record<string, unknown>;
type Task = {
  payload: Record<string, JsonValue>;
  description: string;
  costMicros: number;
  units: string;
  project: (rows: ApiObject[]) => JsonValue;
};

const dryRunOption = Type.Optional(Type.Boolean({ description: "Estimate offline and report credential availability without making any API request." }));
const marketFields = {
  location: Type.Union([Type.Integer({ minimum: 1 }), Type.String({ minLength: 1, maxLength: 100 })], {
    description: "DataForSEO country location code or official country location name, for example 2840 or United States.",
  }),
  language_code: Type.String({ pattern: "^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$", description: "DataForSEO language code, such as en or de." }),
};

function cleanText(value: string, label: string) {
  const text = value.trim();
  if (!text || /\p{Cc}/u.test(text)) throw new Error(`${label} must be nonblank text without control characters.`);
  return text;
}

function market(location: number | string, language_code: string) {
  return {
    ...(typeof location === "number" ? { location_code: location } : { location_name: cleanText(location, "Location") }),
    language_code,
  };
}

function record(value: unknown): ApiObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("Unexpected DataForSEO response format.");
  return value as ApiObject;
}

function rows(value: unknown): ApiObject[] {
  if (value === null) return [];
  if (!Array.isArray(value)) throw new Error("Unexpected DataForSEO result format.");
  return value.map(record);
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function string(value: unknown) {
  return typeof value === "string" ? value : null;
}

function literalKeyword(keyword: string) {
  // The API decodes percent escapes and treats a bare plus as a space.
  return keyword.replaceAll("%", "%25").replaceAll("+", "%2B");
}

async function postTask(endpoint: Endpoint, task: Task, authorization: string, dispatcher?: Dispatcher, signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(45_000);
  let costUsd: number | null = null;
  try {
    const response = await fetch(apiOrigin + endpoint, {
      method: "POST",
      headers: { authorization, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify([task.payload]),
      redirect: "error",
      dispatcher,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      return { costUsd, error: `DataForSEO returned HTTP ${response.status}.` };
    }
    const body = record(await response.json());
    costUsd = number(body.cost);
    if (body.status_code !== 20000) {
      return { costUsd, error: `DataForSEO request failed (status ${number(body.status_code) ?? "unknown"}).` };
    }
    const tasks = rows(body.tasks);
    if (tasks.length !== 1) return { costUsd, error: "Expected one DataForSEO task in the response." };
    const [result] = tasks;
    costUsd ??= number(result.cost);
    if (result.status_code !== 20000) {
      return { costUsd, error: `DataForSEO task failed (status ${number(result.status_code) ?? "unknown"}).` };
    }
    return { costUsd, data: task.project(rows(result.result)) };
  } catch {
    const error = signal?.aborted ? "DataForSEO request cancelled." : timeout.aborted
      ? "DataForSEO request timed out." : "DataForSEO request or response processing failed.";
    return { costUsd, error };
  }
}

async function runBatch(endpoint: Endpoint, dryRun: boolean, buildTasks: () => Task[], ctx: ExtensionContext, signal?: AbortSignal) {
  const [login, password] = credentialNames.map((name) => process.env[name]);
  const missingEnv = credentialNames.filter((name) => !process.env[name]?.trim());
  const available = missingEnv.length === 0;
  const configuration = available ? null : "Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in the environment that launches Pi, then restart Pi.";
  const base = { provider: "DataForSEO", endpoint, available };
  if (!available && !dryRun) return analysisResult({ ...base, status: "not_configured", missingEnv, configuration, fallback });

  let tasks: Task[];
  try {
    tasks = buildTasks();
  } catch (error) {
    return analysisResult({ ...base, status: "invalid_input", message: (error as Error).message, missingEnv, configuration, fallback });
  }

  const totalMicros = tasks.reduce((sum, task) => sum + task.costMicros, 0);
  const requiresConfirmation = totalMicros > confirmationThreshold;
  const estimate = {
    currency: "USD",
    totalUsd: totalMicros / usdMicros,
    thresholdUsd: confirmationThreshold / usdMicros,
    requiresConfirmation,
    pricingSource: pricing[endpoint],
    tasks: tasks.map(({ description, units, costMicros }) => ({ description, units, estimatedUsd: costMicros / usdMicros })),
  };
  const batch = { ...base, estimate };
  if (dryRun) return analysisResult({ ...batch, status: "dry_run", missingEnv, configuration, fallback });
  if (signal?.aborted) return analysisResult({ ...batch, status: "cancelled", fallback });

  if (requiresConfirmation) {
    if (!ctx.hasUI) {
      return analysisResult({ ...batch, status: "confirmation_required", message: "Run in a Pi session with interactive confirmation to approve this batch.", fallback });
    }
    const lines = estimate.tasks.map((task) => `${task.description} (${task.units}): $${task.estimatedUsd}`);
    const message = [`Estimated $${estimate.totalUsd} USD for ${tasks.length} API requests.`, ...lines].join("\n");
    const approved = await ctx.ui.confirm("Approve DataForSEO batch?", message, { signal }).catch(() => false);
    if (!approved || signal?.aborted) return analysisResult({ ...batch, status: signal?.aborted ? "cancelled" : "declined", fallback });
  }

  const authorization = `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
  const proxy = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;
  const results: JsonValue[] = [];
  let reportedMicros = 0;
  let unreportedCosts = 0;
  let failure: { task: number; message: string } | null = null;
  let requestsAttempted = 0;
  let dispatcher: EnvHttpProxyAgent | undefined;
  try {
    if (proxy) dispatcher = new EnvHttpProxyAgent();
    for (const task of tasks) {
      if (signal?.aborted) break;
      requestsAttempted++;
      const result = await postTask(endpoint, task, authorization, dispatcher, signal);
      if (result.costUsd === null) unreportedCosts++;
      else reportedMicros += Math.round(result.costUsd * usdMicros);
      if (result.error !== undefined) {
        failure = { task: requestsAttempted, message: result.error };
        break;
      }
      results.push(result.data);
    }
  } catch {
    failure = { task: requestsAttempted + 1, message: "Could not initialize the DataForSEO connection." };
  } finally {
    await dispatcher?.destroy().catch(() => {});
  }

  const status = results.length === tasks.length ? "ok" : signal?.aborted ? "cancelled" : results.length ? "partial" : "request_failed";
  return analysisResult({
    ...batch, status, results, failure, requestsAttempted,
    unattemptedTasks: tasks.length - requestsAttempted,
    reportedCostUsd: reportedMicros / usdMicros,
    requestsWithoutReportedCost: unreportedCosts,
    ...(status === "ok" ? {} : { fallback }),
  });
}

export const dataForSeoKeywordsTool = defineTool({
  name: "seokit_dataforseo_keywords",
  label: "DataForSEO Google Ads keyword metrics",
  description: "Fetch average monthly search volume and CPC in USD from Google Ads for explicit country and language queries. Use dry_run to check credentials and estimate cost. Pi asks the user to approve batches above $0.50.",
  parameters: Type.Object({
    queries: Type.Array(Type.Object({
      ...marketFields,
      keywords: Type.Array(Type.String({ minLength: 1, maxLength: 80 }), { minItems: 1, maxItems: 1_000 }),
    }, { additionalProperties: false }), { minItems: 1, maxItems: 12 }),
    dry_run: dryRunOption,
  }, { additionalProperties: false }),
  outputSchema: objectOutput,
  async execute(_id, { queries, dry_run }, signal, _onUpdate, ctx) {
    return runBatch("keywords_data/google_ads/search_volume/live", dry_run ?? false, () => queries.map((query) => {
      const scope = market(query.location, query.language_code);
      const keywords = [...new Set(query.keywords.map((value) => cleanText(value, "Keyword").toLowerCase()))];
      if (keywords.some((value) => value.split(/\s+/).length > 10)) throw new Error("Google Ads accepts up to 10 words per keyword.");
      return {
        payload: { ...scope, keywords: keywords.map(literalKeyword) },
        description: `${String(query.location).trim()} / ${query.language_code}`,
        units: `${keywords.length} keyword(s), $0.09 per task`,
        costMicros: 90_000,
        project: (items) => ({
          ...scope,
          returnedKeywords: items.flatMap((item) => typeof item.keyword === "string" ? [{
            keyword: item.keyword, searchVolume: number(item.search_volume), cpcUsd: number(item.cpc),
          }] : []),
          requestedKeywordCount: keywords.length,
        }),
      };
    }), ctx, signal);
  },
});

const searchOperator = /\b(?:allinanchor|allintext|allintitle|allinurl|cache|define|filetype|id|inanchor|info|intext|intitle|inurl|link|site):/gi;

export const dataForSeoSerpTool = defineTool({
  name: "seokit_dataforseo_serp",
  label: "DataForSEO Google organic rankings",
  description: "Fetch up to top_n organic Google results per keyword for a country, language and device. Output may contain fewer organic results when the provider returns less. Use dry_run to estimate spending before calling the live endpoint.",
  parameters: Type.Object({
    ...marketFields,
    keywords: Type.Array(Type.String({ minLength: 1, maxLength: 700 }), { minItems: 1, maxItems: 25 }),
    top_n: Type.Optional(Type.Integer({ minimum: 1, maximum: 200, default: 10 })),
    device: Type.Optional(Type.Union([Type.Literal("desktop"), Type.Literal("mobile")], { default: "desktop" })),
    dry_run: dryRunOption,
  }, { additionalProperties: false }),
  outputSchema: objectOutput,
  async execute(_id, { location, language_code, keywords, top_n = 10, device = "desktop", dry_run }, signal, _onUpdate, ctx) {
    return runBatch("serp/google/organic/live/regular", dry_run ?? false, () => {
      const scope = market(location, language_code);
      const pages = Math.ceil(top_n / 10);
      return [...new Set(keywords.map((keyword) => cleanText(keyword, "Keyword")))].map((keyword) => {
        const operatorCount = [...keyword.matchAll(searchOperator)].length;
        // Use the full live rate for every page and the published per-operator multiplier.
        return {
          payload: { ...scope, keyword: literalKeyword(keyword), depth: pages * 10, device },
          description: `${keyword} (${String(location).trim()} / ${language_code} / ${device})`,
          units: `${pages} page(s) × $0.002${operatorCount ? ` × 5^${operatorCount} for search operators` : ""}`,
          costMicros: pages * 2_000 * 5 ** operatorCount,
          project: ([result]) => ({
            ...scope, keyword, device, requestedTopN: top_n,
            observedAt: string(result?.datetime), searchUrl: string(result?.check_url),
            organic: rows(result ? result.items : null)
              .flatMap((item) => item.type === "organic" && typeof item.url === "string" && typeof item.rank_group === "number"
                ? [{ rank: item.rank_group, absoluteRank: number(item.rank_absolute), url: item.url, title: string(item.title), domain: string(item.domain) }]
                : [])
              .sort((a, b) => a.rank - b.rank)
              .slice(0, top_n),
          }),
        };
      });
    }, ctx, signal);
  },
});

function domainName(input: string) {
  const value = cleanText(input, "Domain");
  if (!/^[\p{L}\p{M}\p{N}.-]+$/u.test(value)) throw new Error("Use a domain or subdomain without a scheme, path, or port.");
  const domain = domainToASCII(value).replace(/^www\./, "").replace(/\.$/, "");
  if (domain.length > 253 || !domain.includes(".") || isIP(domain) ||
    domain.split(".").some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) {
    throw new Error("Use a valid domain or subdomain.");
  }
  return domain;
}

export const dataForSeoBacklinksTool = defineTool({
  name: "seokit_dataforseo_backlinks",
  label: "DataForSEO domain backlink overview",
  description: "Fetch a domain-level backlink summary, including DataForSEO rank (0–1000), live backlink count, referring domains, and spam score. Use dry_run to estimate spending before calling the live endpoint.",
  parameters: Type.Object({
    domains: Type.Array(Type.String({ minLength: 1, maxLength: 254 }), { minItems: 1, maxItems: 25 }),
    include_subdomains: Type.Optional(Type.Boolean({ default: true })),
    dry_run: dryRunOption,
  }, { additionalProperties: false }),
  outputSchema: objectOutput,
  async execute(_id, { domains, include_subdomains = true, dry_run }, signal, _onUpdate, ctx) {
    return runBatch("backlinks/summary/live", dry_run ?? false, () => [...new Set(domains.map(domainName))].map((domain) => ({
      payload: { target: domain, include_subdomains, rank_scale: "one_thousand", backlinks_status_type: "live" },
      description: domain,
      units: "$0.024 per task + $0.000036 for one summary row",
      costMicros: 24_036,
      project: ([summary]) => ({
        domain, includeSubdomains: include_subdomains, rankScale: 1_000,
        rank: number(summary?.rank), backlinks: number(summary?.backlinks),
        referringDomains: number(summary?.referring_domains), referringMainDomains: number(summary?.referring_main_domains),
        backlinksSpamScore: number(summary?.backlinks_spam_score),
      }),
    })), ctx, signal);
  },
});
