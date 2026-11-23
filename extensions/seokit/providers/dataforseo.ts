import { defineTool, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { readFile } from "node:fs/promises";
import { isIP } from "node:net";
import { join } from "node:path";
import { domainToASCII } from "node:url";
import { parseEnv } from "node:util";
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
  project: (rows: ApiObject[], dispatcher?: Dispatcher, signal?: AbortSignal) => JsonValue | Promise<JsonValue>;
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
    return { costUsd, data: await task.project(rows(result.result), dispatcher, signal) };
  } catch {
    const error = signal?.aborted ? "DataForSEO request cancelled." : timeout.aborted
      ? "DataForSEO request timed out." : "DataForSEO request or response processing failed.";
    return { costUsd, error };
  }
}

async function readCredentials(cwd: string, signal?: AbortSignal) {
  const environment = credentialNames.map((name) => process.env[name]);
  if (environment.every((value) => value !== undefined)) return environment;

  try {
    const source = await readFile(join(cwd, "profile", ".env"), { encoding: "utf8", signal });
    const fileEnv = parseEnv(source.replace(/^\uFEFF/, ""));
    return credentialNames.map((name, index) => environment[index] ?? fileEnv[name]);
  } catch {
    // Treat an unavailable file as an absent source and keep file contents out of diagnostics.
    return environment;
  }
}

async function runBatch(endpoint: Endpoint, dryRun: boolean, buildTasks: () => Task[], ctx: ExtensionContext, signal?: AbortSignal) {
  const credentials = await readCredentials(ctx.cwd, signal);
  const [login, password] = credentials;
  const missingEnv = credentialNames.filter((_, index) => !credentials[index]?.trim());
  const available = missingEnv.length === 0;
  const configuration = available ? null : "Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in Pi’s environment or in profile/.env. Process environment values take precedence per variable.";
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

// Google Search hosts from https://www.google.com/supported_domains.
const googleSearchSuffixes = new Set((
  "com ad ae al am as at az ba be bf bg bi bj bs bt by ca cat cd cf cg ch ci cl cm cn cv cz de dj dk dm dz ee es fi fm fr ga ge gg gl gm gr gy hn hr ht hu ie im iq is it je jo ki kg kz la li lk lt lu lv md me mg mk ml mn mu mv mw ne nl no nr nu pl pn ps pt ro rs ru rw sc se sh si sk sm sn so sr st td tg tl tm tn to tt vu ws " +
  "co.ao co.bw co.ck co.cr co.id co.il co.in co.jp co.ke co.kr co.ls co.ma co.mz co.nz co.th co.tz co.ug co.uk co.uz co.ve co.vi co.za co.zm co.zw " +
  "com.af com.ag com.ar com.au com.bd com.bh com.bn com.bo com.br com.bz com.co com.cu com.cy com.do com.ec com.eg com.et com.fj com.gh com.gi com.gt com.hk com.jm com.kh com.kw com.lb com.ly com.mm com.mt com.mx com.my com.na com.ng com.ni com.np com.om com.pa com.pe com.pg com.ph com.pk com.pr com.py com.qa com.sa com.sb com.sg com.sl com.sv com.tj com.tr com.tw com.ua com.uy com.vc com.vn"
).split(" "));

function normalizedHostname(hostname: string) {
  return hostname.replace(/^www\./, "").replace(/\.$/, "");
}

function isDomainName(domain: string) {
  return domain.length <= 253 && domain.includes(".") && !isIP(domain) &&
    domain.split(".").every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
}

function isGoogleSearchHost(hostname: string) {
  const host = normalizedHostname(hostname);
  return host.startsWith("google.") && googleSearchSuffixes.has(host.slice("google.".length));
}

function googleGotoUrl(input: string) {
  const value = input.trim();
  const url = URL.parse(value, value.startsWith("/") ? "https://www.google.com" : undefined);
  if (!url || !/^https?:$/.test(url.protocol) || !isGoogleSearchHost(url.hostname) ||
    url.pathname !== "/goto" || !url.searchParams.has("url")) return null;
  url.hash = "";
  return url;
}

async function resolveGotoUrlLocally(url: URL, dispatcher?: Dispatcher, signal?: AbortSignal) {
  if (url.port || url.username || url.password || !url.searchParams.get("url") || signal?.aborted) return null;
  const timeout = AbortSignal.timeout(5_000);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": "seokit/0.1 (Google SERP link resolution)" },
      dispatcher,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    const location = response.headers.get("location");
    void response.body?.cancel().catch(() => {});
    if (response.status < 300 || response.status >= 400 || !location) return null;

    const target = URL.parse(location, url);
    if (!target || !/^https?:$/.test(target.protocol) || target.username || target.password) return null;
    if (isGoogleSearchHost(target.hostname) && /^\/(?:goto|sorry|url)(?:\/|$)/.test(target.pathname)) return null;
    if (target.hostname === "consent.google.com" || target.hostname === "sorry.google.com") return null;
    if (target.searchParams.has("srsltid")) target.searchParams.delete("srsltid");
    return { url: target.href, domain: normalizedHostname(target.hostname) };
  } catch {
    return null;
  }
}

type GotoResolution = Awaited<ReturnType<typeof resolveGotoUrlLocally>>;

function breadcrumbHostname(value: unknown) {
  const first = string(value)?.trim().split(/[\s›»>]/, 1)[0];
  if (!first) return null;
  const url = URL.parse(/^https?:\/\//i.test(first) ? first : `https://${first}`);
  if (!url || url.username || url.password) return null;
  const host = normalizedHostname(url.hostname);
  return isDomainName(host) ? host : null;
}

function unresolvedDomain(item: ApiObject) {
  const breadcrumb = breadcrumbHostname(item.breadcrumb);
  if (breadcrumb && !isGoogleSearchHost(breadcrumb)) return breadcrumb;
  const websiteName = string(item.website_name)?.trim();
  const host = breadcrumbHostname(websiteName);
  return host && isGoogleSearchHost(host) ? null : host || websiteName || null;
}

async function organicResults(items: ApiObject[], topN: number, cache: Map<string, GotoResolution>, dispatcher?: Dispatcher, signal?: AbortSignal) {
  const top = items.flatMap((item) => item.type === "organic" && typeof item.url === "string" && typeof item.rank_group === "number"
    ? [{ item, url: item.url, rank: item.rank_group }] : [])
    .sort((a, b) => a.rank - b.rank)
    .slice(0, topN)
    .map((entry) => ({ ...entry, goto: googleGotoUrl(entry.url) }));
  const pending = new Map<string, URL>();
  for (const { goto } of top) {
    if (goto && !cache.has(goto.href)) pending.set(goto.href, goto);
  }

  const work = pending.values();
  await Promise.all(Array.from({ length: Math.min(4, pending.size) }, async () => {
    for (const goto of work) {
      if (signal?.aborted) break;
      cache.set(goto.href, await resolveGotoUrlLocally(goto, dispatcher, signal));
    }
  }));

  return top.map<JsonValue>(({ item, url, rank, goto }) => {
    const entry = { rank, absoluteRank: number(item.rank_absolute), url, title: string(item.title), domain: string(item.domain) };
    if (!goto) return entry;
    const resolved = cache.get(goto.href);
    return resolved ? { ...entry, ...resolved } : { ...entry, domain: unresolvedDomain(item), unresolved_goto: true };
  });
}

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
    const gotoCache = new Map<string, GotoResolution>();
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
          project: async ([result], dispatcher, signal) => ({
            ...scope, keyword, device, requestedTopN: top_n,
            observedAt: string(result?.datetime), searchUrl: string(result?.check_url),
            organic: await organicResults(rows(result ? result.items : null), top_n, gotoCache, dispatcher, signal),
          }),
        };
      });
    }, ctx, signal);
  },
});

function domainName(input: string) {
  const value = cleanText(input, "Domain");
  if (!/^[\p{L}\p{M}\p{N}.-]+$/u.test(value)) throw new Error("Use a domain or subdomain without a scheme, path, or port.");
  const domain = normalizedHostname(domainToASCII(value));
  if (!isDomainName(domain)) throw new Error("Use a valid domain or subdomain.");
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
