import { defineTool, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { load } from "cheerio";
import { readFile } from "node:fs/promises";
import { isIP } from "node:net";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { domainToASCII } from "node:url";
import { parseEnv } from "node:util";
import { Type } from "typebox";
import { EnvHttpProxyAgent, fetch, type Dispatcher, type Response } from "undici";
import { analysisResult, objectOutput, type JsonValue } from "../tools/result.js";

const liveApiOrigin = "https://api.dataforseo.com/v3/";
const sandboxApiOrigin = "https://sandbox.dataforseo.com/v3/";
const usdMicros = 1_000_000;
const confirmationThreshold = 500_000;
const credentialNames = ["DATAFORSEO_LOGIN", "DATAFORSEO_PASSWORD"] as const;
const settingNames = [...credentialNames, "DATAFORSEO_SANDBOX"] as const;
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
  timeoutMs?: number;
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

async function postTask(apiOrigin: string, endpoint: Endpoint, task: Task, authorization: string, dispatcher?: Dispatcher, signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(task.timeoutMs ?? 45_000);
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

async function readSettings(cwd: string, signal?: AbortSignal) {
  const environment = settingNames.map((name) => process.env[name]);
  if (environment.every((value) => value !== undefined)) return environment;

  try {
    const source = await readFile(join(cwd, "profile", ".env"), { encoding: "utf8", signal });
    const fileEnv = parseEnv(source.replace(/^\uFEFF/, ""));
    return settingNames.map((name, index) => environment[index] ?? fileEnv[name]);
  } catch {
    // Treat an unavailable file as an absent source and keep file contents out of diagnostics.
    return environment;
  }
}

async function runBatch(endpoint: Endpoint, dryRun: boolean, buildTasks: (sandbox: boolean) => Task[], ctx: ExtensionContext, signal?: AbortSignal) {
  const [login, password, sandboxSetting] = await readSettings(ctx.cwd, signal);
  const sandbox = sandboxSetting === "1";
  const apiOrigin = sandbox ? sandboxApiOrigin : liveApiOrigin;
  const credentials = [login, password];
  const missingEnv = credentialNames.filter((_, index) => !credentials[index]?.trim());
  const available = missingEnv.length === 0;
  const configuration = available ? null : "Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in Pi’s environment or in profile/.env. Process environment values take precedence per variable.";
  const base = { provider: "DataForSEO", endpoint, available, sandbox };
  if (!available && !dryRun) return analysisResult({ ...base, status: "not_configured", missingEnv, configuration, fallback });

  let tasks: Task[];
  try {
    tasks = buildTasks(sandbox);
  } catch (error) {
    return analysisResult({ ...base, status: "invalid_input", message: (error as Error).message, missingEnv, configuration, fallback });
  }

  const totalMicros = sandbox ? 0 : tasks.reduce((sum, task) => sum + task.costMicros, 0);
  const requiresConfirmation = totalMicros > confirmationThreshold;
  const estimate = {
    currency: "USD",
    totalUsd: totalMicros / usdMicros,
    thresholdUsd: confirmationThreshold / usdMicros,
    requiresConfirmation,
    pricingSource: sandbox ? "https://docs.dataforseo.com/v3/appendix-sandbox/" : pricing[endpoint],
    tasks: tasks.map(({ description, units, costMicros }) => ({
      description,
      units: sandbox ? "Sandbox request" : units,
      estimatedUsd: sandbox ? 0 : costMicros / usdMicros,
    })),
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
      const result = await postTask(apiOrigin, endpoint, task, authorization, dispatcher, signal);
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

const maxGoogleRedirects = 3;
const maxGotoHtmlBytes = 128 * 1024;
const gotoToken = /(?:^\?|&)url(?:=([^&]*))?(?=&|$)/;

type GotoTarget = { requestUrl: string; url: URL };
type GotoResolution = { url: string; domain: string } | { error: string };

// Concurrent SERP calls can return links that share a Google session.
let gotoQueue = Promise.resolve();
let nextGotoRequestAt = 0;

function isGoogleDomain(hostname: string) {
  const match = /(?:^|\.)google\.(.+)$/.exec(hostname.replace(/\.$/, ""));
  return match !== null && googleSearchSuffixes.has(match[1]);
}

function googleGotoUrl(input: string): GotoTarget | null {
  // Validate a separate URL object while keeping the provider's request string intact.
  const requestUrl = input.startsWith("//") ? `https:${input}`
    : input.startsWith("/") ? `https://www.google.com${input}`
    : input.replace(/^https:\/\/google\.com\/goto(?=\?)/, "https://www.google.com/goto");
  const url = URL.parse(requestUrl);
  if (!url || !/^https?:$/.test(url.protocol) || !isGoogleSearchHost(url.hostname) ||
    url.pathname !== "/goto" || !gotoToken.test(url.search)) return null;
  return { requestUrl, url };
}

function gotoTarget(value: string, base: URL): GotoTarget | null {
  if (!value.trim()) return null;
  const url = URL.parse(value, base);
  if (!url || !/^https?:$/.test(url.protocol) || url.username || url.password) return null;
  return { requestUrl: /^https?:\/\//i.test(value) ? value : url.href, url };
}

function cleanLandingUrl(url: URL) {
  if (url.searchParams.has("srsltid")) {
    url.search = url.search.slice(1).split("&")
      .filter((parameter) => !new URLSearchParams(`?${parameter}`).has("srsltid")).join("&");
  }
  return { url: url.href, domain: normalizedHostname(url.hostname) };
}

async function gotoHtmlTarget(response: Response, base: URL) {
  const reader = response.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (size < maxGotoHtmlBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = value.subarray(0, maxGotoHtmlBytes - size);
      chunks.push(chunk);
      size += chunk.byteLength;
    }
  } finally {
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  const $ = load(Buffer.concat(chunks).toString("utf8"), { scriptingEnabled: false });
  const refresh = $('meta[http-equiv="refresh" i]').first().attr("content") ?? "";
  const refreshUrl = /[;,]\s*url\s*=\s*(.+)/is.exec(refresh)?.[1].trim().replace(/^(["'])(.*)\1$/s, "$2");
  const canonical = $('link[rel~="canonical" i]').first().attr("href");
  return gotoTarget(refreshUrl ?? "", base) ?? gotoTarget(canonical ?? "", base);
}

function gotoRequestError(error: unknown) {
  const cause = error instanceof Error ? (error.cause ?? error) : null;
  const code = cause && typeof cause === "object" && "code" in cause ? cause.code : null;
  if (code === "ETIMEDOUT" || code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "UND_ERR_HEADERS_TIMEOUT" || code === "UND_ERR_BODY_TIMEOUT") return "timeout";
  // Include a system error code when available without exposing raw errors or proxy URLs.
  return typeof code === "string" && /^[A-Z][A-Z0-9_]{1,63}$/.test(code) ? `network_error: ${code}` : "network_error";
}

function gotoProxyHint(error: string, dispatcher?: Dispatcher) {
  if (!error.startsWith("network_error") && !["timeout", "http_200_no_redirect", "http_403", "http_407", "http_429", "google_sorry"].includes(error)) return;
  if (dispatcher) return "Proxy environment detected. Verify HTTPS_PROXY (or https_proxy) and whether NO_PROXY bypasses Google.";
  const proxyFlag = process.env.NODE_USE_ENV_PROXY === "1" ? "NODE_USE_ENV_PROXY=1 is set. " : "";
  return `${proxyFlag}Set HTTPS_PROXY (or https_proxy) if Google requires a proxy. Undici uses the proxy URL directly.`;
}

async function fetchGoto({ requestUrl, url }: GotoTarget, dispatcher?: Dispatcher, signal?: AbortSignal): Promise<{ target: GotoTarget } | { error: string }> {
  const wait = Math.ceil(nextGotoRequestAt - performance.now());
  if (wait > 0) await delay(wait, undefined, { signal });
  signal?.throwIfAborted();
  const timeout = AbortSignal.timeout(10_000);
  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": "Mozilla/5.0", Connection: "close" },
      dispatcher,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    if (response.status === 200) {
      const target = await gotoHtmlTarget(response, url);
      return target ? { target } : { error: "http_200_no_redirect" };
    }

    await response.body?.cancel().catch(() => {});
    if (response.status < 300 || response.status >= 400) return { error: `http_${response.status}` };
    const location = response.headers.get("location");
    if (!location) return { error: `http_${response.status}_missing_location` };
    const target = gotoTarget(location, url);
    return target ? { target } : { error: "invalid_redirect_url" };
  } catch (error) {
    return { error: signal?.aborted ? "cancelled" : timeout.aborted ? "timeout" : gotoRequestError(error) };
  } finally {
    nextGotoRequestAt = performance.now() + 800;
  }
}

async function resolveGotoUrlLocally(initial: GotoTarget, dispatcher?: Dispatcher, signal?: AbortSignal): Promise<GotoResolution> {
  const { url: initialUrl } = initial;
  if (initialUrl.port || initialUrl.username || initialUrl.password || !gotoToken.exec(initialUrl.search)?.[1]) return { error: "invalid_goto_url" };
  const retryDelays = [2_000, 4_000];
  const visited = new Set<string>();
  let current = initial;
  let retries = 0;
  try {
    for (let redirects = 0; ; redirects++) {
      signal?.throwIfAborted();
      const requestKey = current.url.href.split("#", 1)[0];
      if (visited.has(requestKey)) return { error: "still_google_redirect" };
      visited.add(requestKey);

      let result = await fetchGoto(current, dispatcher, signal);
      while ("error" in result && retries < retryDelays.length &&
        (result.error === "http_400" || result.error === "http_429" || result.error === "timeout")) {
        await delay(retryDelays[retries++], undefined, { signal });
        result = await fetchGoto(current, dispatcher, signal);
      }
      if ("error" in result) return result;
      const { target } = result;
      const { url: nextUrl } = target;
      if (!isGoogleDomain(nextUrl.hostname)) return cleanLandingUrl(nextUrl);
      if (/^\/sorry(?:\/|$)/i.test(nextUrl.pathname) || nextUrl.hostname.startsWith("sorry.google.")) return { error: "google_sorry" };
      if (nextUrl.port) return { error: "invalid_redirect_url" };
      if (redirects >= maxGoogleRedirects) return { error: "still_google_redirect" };
      current = target;
    }
  } catch (error) {
    return { error: signal?.aborted ? "cancelled" : gotoRequestError(error) };
  }
}

function queueGotoResolution(goto: GotoTarget, dispatcher?: Dispatcher, signal?: AbortSignal) {
  const resolution = gotoQueue.then(() => resolveGotoUrlLocally(goto, dispatcher, signal));
  gotoQueue = resolution.then(() => {}, () => {});
  return resolution;
}

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

async function organicResults(items: ApiObject[], topN: number, cache: Map<string, GotoResolution>, sandbox: boolean, dispatcher?: Dispatcher, signal?: AbortSignal) {
  const top = items.flatMap((item) => item.type === "organic" && typeof item.url === "string" && typeof item.rank_group === "number"
    ? [{ item, url: item.url, rank: item.rank_group }] : [])
    .sort((a, b) => a.rank - b.rank)
    .slice(0, topN)
    .map((entry) => ({ ...entry, goto: googleGotoUrl(entry.url) }));
  for (const { goto } of top) {
    if (sandbox || signal?.aborted) break;
    if (goto && !cache.has(goto.requestUrl)) {
      cache.set(goto.requestUrl, await queueGotoResolution(goto, dispatcher, signal));
    }
  }

  return top.map<JsonValue>(({ item, url, rank, goto }) => {
    const entry = { rank, absoluteRank: number(item.rank_absolute), url, title: string(item.title), domain: string(item.domain) };
    if (!goto) {
      const landing = URL.parse(url);
      return landing && /^https?:$/.test(landing.protocol) ? { ...entry, ...cleanLandingUrl(landing) } : entry;
    }
    const resolved = cache.get(goto.requestUrl);
    if (resolved && "url" in resolved) return { ...entry, ...resolved };
    const error = resolved?.error ?? (sandbox ? "sandbox_sample" : "cancelled");
    const hint = gotoProxyHint(error, dispatcher);
    return {
      ...entry, domain: unresolvedDomain(item), unresolved_goto: true, goto_resolve_error: error,
      ...(hint ? { goto_resolve_hint: hint } : {}),
    };
  });
}

export const dataForSeoSerpTool = defineTool({
  name: "seokit_dataforseo_serp",
  label: "DataForSEO Google organic rankings",
  description: "Fetch up to top_n organic Google results per keyword for a country, language and device. Output may contain fewer organic results when the provider returns less. DataForSEO resolves Google goto links by default, with local resolution for remaining goto links. Use dry_run to estimate spending before calling the live endpoint.",
  parameters: Type.Object({
    ...marketFields,
    keywords: Type.Array(Type.String({ minLength: 1, maxLength: 700 }), { minItems: 1, maxItems: 25 }),
    top_n: Type.Optional(Type.Integer({ minimum: 1, maximum: 200, default: 10 })),
    device: Type.Optional(Type.Union([Type.Literal("desktop"), Type.Literal("mobile")], { default: "desktop" })),
    resolve_goto_urls: Type.Optional(Type.Boolean({ default: true, description: "Ask DataForSEO to resolve Google goto links on the same Live request. Set false to use local resolution only." })),
    dry_run: dryRunOption,
  }, { additionalProperties: false }),
  outputSchema: objectOutput,
  async execute(_id, { location, language_code, keywords, top_n = 10, device = "desktop", resolve_goto_urls = true, dry_run }, signal, _onUpdate, ctx) {
    const gotoCache = new Map<string, GotoResolution>();
    return runBatch("serp/google/organic/live/regular", dry_run ?? false, (sandbox) => {
      const scope = market(location, language_code);
      const pages = Math.ceil(top_n / 10);
      return [...new Set(keywords.map((keyword) => cleanText(keyword, "Keyword")))].map((keyword) => {
        const operatorCount = [...keyword.matchAll(searchOperator)].length;
        // Use the full live rate for every page and the published per-operator multiplier.
        return {
          payload: { ...scope, keyword: literalKeyword(keyword), depth: pages * 10, device, resolve_goto_urls },
          timeoutMs: 90_000,
          description: `${keyword} (${String(location).trim()} / ${language_code} / ${device})`,
          units: `${pages} page(s) × $0.002${operatorCount ? ` × 5^${operatorCount} for search operators` : ""}`,
          costMicros: pages * 2_000 * 5 ** operatorCount,
          project: async ([result], dispatcher, signal) => ({
            ...scope, keyword, device, requestedTopN: top_n,
            observedAt: string(result?.datetime), searchUrl: string(result?.check_url),
            organic: await organicResults(rows(result ? result.items : null), top_n, gotoCache, sandbox, dispatcher, signal),
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
