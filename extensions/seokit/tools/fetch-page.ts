import { defineTool } from "@earendil-works/pi-coding-agent";
import { decodeBuffer } from "encoding-sniffer";
import { lookup } from "node:dns/promises";
import { BlockList, isIP, type LookupFunction } from "node:net";
import { Type } from "typebox";
import { Agent, EnvHttpProxyAgent, fetch, type Dispatcher, type Response } from "undici";
import { MAX_HTML_BYTES, analysisResult, objectOutput } from "./result.js";
import { analyzeRobots } from "./robots.js";

const MAX_REDIRECTS = 10;
const MAX_SITE_FILE_BYTES = 512 * 1024;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const reserved = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24],
  ["203.0.113.0", 24], ["224.0.0.0", 3],
] as const) reserved.addSubnet(address, prefix, "ipv4");
for (const [address, prefix] of [["2001::", 23], ["2001:db8::", 32], ["2002::", 16], ["3fff::", 20]] as const) {
  reserved.addSubnet(address, prefix, "ipv6");
}
const globalIPv6 = new BlockList();
globalIPv6.addSubnet("2000::", 3, "ipv6");

async function publicAddresses(hostname: string) {
  const addresses = await lookup(hostname, { all: true });
  for (const { address, family } of addresses) {
    const version = family === 6 ? "ipv6" : "ipv4";
    if (reserved.check(address, version) || (family === 6 && !globalIPv6.check(address, "ipv6"))) {
      throw new Error(`Target resolves to a non-public address: ${hostname}`);
    }
  }
  if (addresses.length === 0) throw new Error(`Target has no IP address: ${hostname}`);
  return addresses;
}

const publicLookup: LookupFunction = (hostname, options, callback) => {
  publicAddresses(hostname).then((addresses) => {
    const matches = addresses.filter(({ family }) => !options.family || family === options.family);
    const first = matches[0];
    if (!first) return callback(new Error(`No matching IP address for ${hostname}`), "", 0);
    if (options.all) return callback(null, matches);
    callback(null, first.address, first.family);
  }, (error: Error) => callback(error, "", 0));
};

function createPageDispatcher() {
  const proxied = Boolean(process.env.http_proxy || process.env.HTTP_PROXY || process.env.https_proxy || process.env.HTTPS_PROXY);
  const options = { connect: { lookup: publicLookup } };
  const dispatcher = proxied ? new EnvHttpProxyAgent(options) : new Agent(options);
  return { dispatcher, proxied };
}

function webUrl(input: string, base?: URL): URL {
  const url = new URL(input, base);
  if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
    throw new Error("Use a public HTTP(S) URL without credentials.");
  }
  url.hash = "";
  return url;
}

function timeoutSignal(timeout: number, signal?: AbortSignal): AbortSignal {
  const timeoutOnly = AbortSignal.timeout(timeout);
  return signal ? AbortSignal.any([signal, timeoutOnly]) : timeoutOnly;
}

async function readBody(response: Response, maxBytes: number) {
  const chunks: Uint8Array[] = [];
  const reader = response.body?.getReader();
  let size = 0;
  let truncated = false;
  if (reader) {
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const available = maxBytes - size;
        if (value.byteLength > available) {
          if (available > 0) chunks.push(value.subarray(0, available));
          truncated = true;
          await reader.cancel();
          break;
        }
        chunks.push(value);
        size += value.byteLength;
      }
    } finally {
      reader.releaseLock();
    }
  }
  const charset = /;\s*charset\s*=\s*["']?([^;\s"']+)/i.exec(response.headers.get("content-type") ?? "")?.[1];
  const text = decodeBuffer(Buffer.concat(chunks), { transportLayerEncodingLabel: charset, defaultEncoding: "utf-8" });
  return { text, truncated };
}

async function getPage(url: URL, dispatcher: Dispatcher, signal: AbortSignal, proxied: boolean, maxBytes: number) {
  const redirects: { url: string; status: number; location: string }[] = [];
  for (;;) {
    signal.throwIfAborted();
    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    // Direct connections validate within the socket lookup. Proxies resolve DNS themselves.
    if (proxied || isIP(hostname)) await publicAddresses(hostname);
    const response = await fetch(url, {
      dispatcher,
      signal,
      redirect: "manual",
      headers: { "user-agent": "seokit/0.1 (SEO audit)", accept: "text/html, text/plain, text/markdown, */*;q=0.1" },
    });
    const location = response.headers.get("location");
    if (location && REDIRECT_STATUSES.has(response.status)) {
      await response.body?.cancel();
      if (redirects.length >= MAX_REDIRECTS) throw new Error(`Too many redirects (maximum ${MAX_REDIRECTS}).`);
      const next = webUrl(location, url);
      redirects.push({ url: url.href, status: response.status, location: next.href });
      url = next;
      continue;
    }
    const headers: Record<string, string | string[]> = Object.fromEntries(response.headers);
    if (response.headers.has("set-cookie")) headers["set-cookie"] = response.headers.getSetCookie();
    return {
      url: url.href,
      status: response.status,
      contentType: response.headers.get("content-type"),
      headers,
      redirects,
      ...await readBody(response, maxBytes),
    };
  }
}

async function probeFile(path: string, origin: URL, dispatcher: Dispatcher, proxied: boolean, signal?: AbortSignal) {
  const requested = new URL(path, origin);
  try {
    const { url, status, contentType, text, truncated } = await getPage(
      requested, dispatcher, timeoutSignal(8_000, signal), proxied, MAX_SITE_FILE_BYTES,
    );
    const looksLikeHtml = /^(?:text\/html|application\/xhtml\+xml)\b/i.test(contentType ?? "") ||
      /^\s*(?:<!doctype\s+html|<html\b|<head\b|<body\b)/i.test(text);
    const exists = status >= 200 && status < 300 ? !looksLikeHtml
      : status === 404 || status === 410 ? false : null;
    return { url, status, contentType, exists, truncated, text: exists ? text : null, error: null };
  } catch (error) {
    signal?.throwIfAborted();
    return {
      url: requested.href, status: null, contentType: null, exists: null, truncated: false, text: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function probeRobots(target: URL, dispatcher: Dispatcher, proxied: boolean, signal?: AbortSignal) {
  const { text, ...metadata } = await probeFile("/robots.txt", target, dispatcher, proxied, signal);
  return { ...metadata, ...analyzeRobots(text, target, metadata.exists === false) };
}

export const checkRobotsTool = defineTool({
  name: "seokit_check_robots",
  label: "Check crawler rules for a URL",
  description: "Check robots.txt rules for a public HTTP(S) URL, including AI crawler decisions and matched rules for its path and query. Pass the final page URL after redirects. Fetches robots.txt only.",
  parameters: Type.Object({ url: Type.String({ minLength: 1 }) }, { additionalProperties: false }),
  outputSchema: objectOutput,
  annotations: { readOnlyHint: true, openWorldHint: true },
  async execute(_id, { url }, signal) {
    const target = webUrl(url);
    const { dispatcher, proxied } = createPageDispatcher();
    try {
      const robots = await probeRobots(target, dispatcher, proxied, signal);
      return analysisResult({ targetUrl: target.href, ...robots });
    } finally {
      await dispatcher.destroy();
    }
  },
});

export const fetchPageTool = defineTool({
  name: "seokit_fetch_page",
  label: "Fetch page and crawler files",
  description: "Fetch a public HTTP(S) URL. Returns HTML (up to 2 MiB) in structured output, status, headers, redirect chain, and robots.txt and llms.txt checks for the final origin. Use structured output to pass HTML to the SEO and GEO tools.",
  parameters: Type.Object({ url: Type.String({ minLength: 1 }) }, { additionalProperties: false }),
  outputSchema: objectOutput,
  annotations: { readOnlyHint: true, openWorldHint: true },
  async execute(_id, { url }, signal) {
    const requested = webUrl(url);
    const { dispatcher, proxied } = createPageDispatcher();
    try {
      const page = await getPage(requested, dispatcher, timeoutSignal(15_000, signal), proxied, MAX_HTML_BYTES);
      const { text: html, ...metadata } = page;
      const finalUrl = new URL(page.url);
      const [robots, llms] = await Promise.all([
        probeRobots(finalUrl, dispatcher, proxied, signal),
        probeFile("/llms.txt", finalUrl, dispatcher, proxied, signal),
      ]);
      const { text: _llmsText, ...llmsMetadata } = llms;
      const result = { requestedUrl: requested.href, ...metadata, robots, llms: llmsMetadata };
      return analysisResult({ ...result, html }, { ...result, htmlCharacters: html.length });
    } finally {
      await dispatcher.destroy();
    }
  },
});
