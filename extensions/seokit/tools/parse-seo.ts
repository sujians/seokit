import { defineTool } from "@earendil-works/pi-coding-agent";
import { load } from "cheerio";
import { Type } from "typebox";
import { MAX_HTML_BYTES, analysisResult, objectOutput, type JsonValue } from "./result.js";

function httpUrl(value: string, base?: URL): URL | null {
  try {
    const url = new URL(value, base);
    return /^https?:$/.test(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function hostname(url: URL): string {
  return url.hostname.replace(/^www\./, "").replace(/\.$/, "");
}

function parseSeo(html: string, url: string) {
  const page = httpUrl(url);
  if (!page) throw new Error("Provide the page's absolute HTTP(S) URL.");
  const $ = load(html);
  const base = $("head base[href]").map((_, tag) => httpUrl($(tag).attr("href")!.trim(), page)).get()[0] ?? page;
  const resolveHref = (href: string) => href ? httpUrl(href, base)?.href ?? null : null;

  const description = $("head meta[name]").filter((_, tag) => $(tag).attr("name")?.trim().toLowerCase() === "description");
  const robots = $("head meta[name][content]").map((_i, tag) => {
    const name = $(tag).attr("name")!.trim().toLowerCase();
    const content = $(tag).attr("content")!.trim();
    return /^(?:robots|(?:[\w-]*bot|[\w-]*spider)(?:-[\w-]+)?)$/.test(name) ? [{ name, content }] : [];
  }).get();
  const canonical: { href: string; url: string | null }[] = [];
  const hreflang: { language: string; href: string; url: string | null }[] = [];
  $("head link[rel]").each((_, tag) => {
    const rel = ($(tag).attr("rel") ?? "").toLowerCase().split(/\s+/);
    const href = ($(tag).attr("href") ?? "").trim();
    if (rel.includes("canonical")) canonical.push({ href, url: resolveHref(href) });
    if (rel.includes("alternate") && $(tag).is("[hreflang]")) {
      hreflang.push({ language: ($(tag).attr("hreflang") ?? "").trim(), href, url: resolveHref(href) });
    }
  });

  const headingCounts = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
  let previousLevel = 0;
  const headings = $("body h1, body h2, body h3, body h4, body h5, body h6").map((_, tag) => {
    const name = tag.name as keyof typeof headingCounts;
    const level = Number(name[1]);
    const skippedLevel = level > previousLevel + 1;
    previousLevel = level;
    headingCounts[name]++;
    return { level, text: cleanText($(tag).text()), id: $(tag).attr("id") ?? null, skippedLevel };
  }).get();

  const images = $("body img");
  const missingAlt = images.filter((_, tag) => $(tag).attr("alt") === undefined).length;
  const emptyAlt = images.filter((_, tag) => $(tag).attr("alt")?.trim() === "").length;
  const internalUrls = new Set<string>();
  const externalUrls = new Set<string>();
  let internal = 0;
  let external = 0;
  let ignored = 0;
  $("body a[href]").each((_, tag) => {
    const href = $(tag).attr("href")!.trim();
    const target = href && !href.startsWith("#") ? httpUrl(href, base) : null;
    if (!target) {
      ignored++;
      return;
    }
    target.hash = "";
    if (hostname(page) === hostname(target)) {
      internal++;
      internalUrls.add(target.href);
    } else {
      external++;
      externalUrls.add(target.href);
    }
  });

  const jsonLd = $("script[type]").filter((_, tag) =>
    $(tag).attr("type")!.split(";", 1)[0].trim().toLowerCase() === "application/ld+json").map((index, tag) => {
    const raw = $(tag).html()?.trim() ?? "";
    try {
      const data: JsonValue = JSON.parse(raw);
      JSON.stringify(data);
      return { index, raw, data, parseError: null };
    } catch (error) {
      return { index, raw, data: null, parseError: error instanceof Error ? error.message : String(error) };
    }
  }).get();

  return {
    url: page.href,
    baseUrl: base.href,
    title: cleanText($("head > title").first().text()) || null,
    metaDescription: description.first().attr("content")?.trim() || null,
    canonical,
    robots,
    headings,
    headingCounts,
    images: { total: images.length, missingAlt, emptyAlt, missingAltRatio: images.length ? missingAlt / images.length : 0 },
    links: { internal, external, ignored, uniqueInternal: internalUrls.size, uniqueExternal: externalUrls.size },
    hreflang,
    jsonLd,
  };
}

export const parseSeoTool = defineTool({
  name: "seokit_parse_seo",
  label: "Parse on-page SEO",
  description: "Extract metadata, heading hierarchy, image alt and link counts, hreflang and raw/parsed JSON-LD from HTML. Pass the final page URL for relative links.",
  parameters: Type.Object({
    url: Type.String({ minLength: 1 }),
    html: Type.String({ maxLength: MAX_HTML_BYTES }),
  }, { additionalProperties: false }),
  outputSchema: objectOutput,
  annotations: { readOnlyHint: true, openWorldHint: false },
  async execute(_id, { html, url }) {
    const result = parseSeo(html, url);
    const { jsonLd, ...display } = result;
    return analysisResult(result, {
      ...display,
      jsonLd: jsonLd.map(({ index, parseError }) => ({ index, parseError })),
    });
  },
});
