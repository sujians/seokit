import { defineTool } from "@earendil-works/pi-coding-agent";
import { parse } from "csv-parse/sync";
import { constants } from "node:fs";
import { open } from "node:fs/promises";
import { resolve } from "node:path";
import { Type } from "typebox";
import { analysisResult, objectOutput } from "./result.js";

const MAX_CSV_BYTES = 2 * 1024 * 1024;
const keywordHeaders = ["keyword", "keywords", "query", "search term", "search query", "term", "关键词", "关键字", "搜索词", "查询词"];
const metadataHeaders = {
  volume: ["volume", "search volume", "avg monthly searches", "average monthly searches", "搜索量", "月搜索量"],
  difficulty: ["difficulty", "keyword difficulty", "kd", "kd%", "关键词难度"],
  intent: ["intent", "search intent", "搜索意图"],
  market: ["market", "country", "region", "location", "市场", "国家", "地区"],
  language: ["language", "lang", "语言"],
  currentUrl: ["url", "landing page", "current url", "ranking url", "着陆页"],
  source: ["source", "provider", "来源"],
  date: ["date", "as of", "日期"],
};
const delimiters = { comma: ",", semicolon: ";", tab: "\t" };

function normalizeHeader(value: string) {
  return value.normalize("NFKC").trim().toLowerCase().replace(/[_\s-]+/g, " ");
}

async function readCsv(path: string, signal?: AbortSignal) {
  signal?.throwIfAborted();
  const file = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
  try {
    const stat = await file.stat();
    if (!stat.isFile()) throw new Error("Expected a regular CSV file.");
    if (stat.size > MAX_CSV_BYTES) throw new Error("CSV exceeds 2 MiB. Split it by topic or market.");
    const chunks: Buffer[] = [];
    // The inclusive end allows detecting growth beyond the limit after stat.
    for await (const chunk of file.createReadStream({ end: MAX_CSV_BYTES, autoClose: false, signal })) {
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    if (bytes.length > MAX_CSV_BYTES) throw new Error("CSV exceeds 2 MiB. Split it by topic or market.");
    const encoding = bytes[0] === 0xff && bytes[1] === 0xfe ? "utf-16le"
      : bytes[0] === 0xfe && bytes[1] === 0xff ? "utf-16be" : "utf-8";
    try {
      return new TextDecoder(encoding, { fatal: true }).decode(bytes);
    } catch {
      throw new Error("CSV encoding is unsupported. Export as UTF-8 or UTF-16 with a BOM.");
    }
  } finally {
    await file.close();
  }
}

export const readKeywordCsvTool = defineTool({
  name: "seokit_read_keyword_csv",
  label: "Read keyword CSV",
  description: "Parse a user-provided local keyword CSV, including quoted fields and multiline records. Returns paginated keyword rows and available SEO metadata as raw text.",
  parameters: Type.Object({
    path: Type.String({ minLength: 1, description: "File path provided by the user, relative to the current project or absolute." }),
    delimiter: Type.Optional(Type.Union([Type.Literal("comma"), Type.Literal("semicolon"), Type.Literal("tab")])),
    keywordColumn: Type.Optional(Type.String({ minLength: 1, description: "Header of the keyword column when it is named differently." })),
    headerless: Type.Optional(Type.Boolean({ description: "Use for a confirmed single-column file without a header." })),
    offset: Type.Optional(Type.Integer({ minimum: 0, description: "Start at this zero-based offset among nonblank keyword rows." })),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  }, { additionalProperties: false }),
  outputSchema: objectOutput,
  async execute(_toolCallId, { path, delimiter = "comma", keywordColumn, headerless = false, offset = 0, limit = 25 }, signal, _onUpdate, ctx) {
    const source = await readCsv(resolve(ctx.cwd, path), signal);
    signal?.throwIfAborted();
    let records: string[][];
    try {
      records = parse(source, { delimiter: delimiters[delimiter], skip_empty_lines: true, trim: true, max_record_size: 16_384 });
    } catch (error) {
      throw new Error(`Invalid keyword CSV: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!records.length) throw new Error("The keyword CSV is empty.");
    if (headerless && (keywordColumn !== undefined || records[0].length !== 1)) {
      throw new Error("Headerless import requires a single column and no keywordColumn option.");
    }
    const headers = headerless ? ["keyword"] : records[0].map(normalizeHeader);
    const keywordAliases = keywordColumn === undefined ? keywordHeaders : [normalizeHeader(keywordColumn)];
    const keywordIndex = headers.findIndex((header) => keywordAliases.includes(header));
    if (keywordIndex < 0) throw new Error("Keyword column not found. Check the delimiter, specify keywordColumn, or confirm a single-column headerless file.");
    if (headers.indexOf(headers[keywordIndex], keywordIndex + 1) !== -1) {
      throw new Error("The keyword column header is duplicated. Use a unique header.");
    }
    const columns = Object.entries(metadataHeaders).map(([key, aliases]) => ({
      key,
      index: headers.findIndex((header, index) => index !== keywordIndex && aliases.includes(header)),
    })).filter(({ index }) => index >= 0);
    const data = headerless ? records : records.slice(1);
    const keywords = data.flatMap((record, index) => {
      const keyword = record[keywordIndex].trim();
      return keyword ? [{ record, keyword, recordNumber: index + 1 }] : [];
    });
    if (!keywords.length) throw new Error("No nonblank keywords were found in the CSV.");
    const rows = keywords.slice(offset, offset + limit).map(({ record, keyword, recordNumber }) => {
      const metadata: Record<string, string> = {};
      for (const { key, index } of columns) {
        const value = record[index].trim();
        if (value) metadata[key] = value;
      }
      return { recordNumber, keyword, ...metadata };
    });
    return analysisResult({
      path,
      keywordColumn: headerless ? null : records[0][keywordIndex],
      totalKeywords: keywords.length,
      skippedBlank: data.length - keywords.length,
      offset,
      nextOffset: offset + rows.length < keywords.length ? offset + rows.length : null,
      rows,
    });
  },
});
