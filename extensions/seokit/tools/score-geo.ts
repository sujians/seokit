import { defineTool } from "@earendil-works/pi-coding-agent";
import { load } from "cheerio";
import { Type } from "typebox";
import { MAX_HTML_BYTES, analysisResult, objectOutput } from "./result.js";

const STANDARD = /\b(?:ISO(?:\s*\/\s*IEC)?|IEC|ASTM|EN|DIN|ANSI|ASME|UL|SAE|JIS|GB(?:\s*\/\s*T)?)\s*[-:]?\s*[A-Z]?\s*\d{2,}(?:[-:]\d+)*\b/gi;
const MEASUREMENT = /(?:[$€£]\s*\d[\d.,]*|\d[\d.,]*\s*(?:[%％℃°×μµ]|mm|cm|m²|m³|m|kg|mg|g|mL|L|min|hours?|days?|weeks?|psi|bar|MPa|kPa|kN|Nm|N|V|mA|A|W|kW|Hz|rpm|dB|pieces?|units?|pcs|毫米|厘米|千克|公斤|件|天|周)(?![\p{L}\p{N}]))/giu;
const ATTRIBUTION = /\b(?:according to|as (?:reported|measured|specified) by|data from|test(?:ed|ing) (?:to|per)|selon|según|gemäß)\s+\S+|(?:根据|依据|参照)\s*\S+/giu;
const ANSWER = /\b(?:is (?:a|an|the|defined as)|refers? to|means|requires?|supports?|meets?|provides?|ranges? from|typically takes|weighs?|withstands?|is made (?:of|from)|est un(?:e)?|se refiere a|ist ein(?:e)?)\b|(?:是指|指的是|适用于|符合|采用|由.{1,20}制成|公差为|起订量为|交期为)/iu;
const DEPENDENT_START = /^(?:(?:it|they|this|these|those|that|which|as noted|as above|the following)\b|如上|如下|上述|该|这些|它们?)/iu;
const HEADING = "h1,h2,h3,h4,h5,h6";
const PARAGRAPH = "p,blockquote,dd";

function clean(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function evidence(text: string) {
  return {
    measurements: [...text.matchAll(MEASUREMENT)].length,
    standards: [...text.matchAll(STANDARD)].length,
    attributions: [...text.matchAll(ATTRIBUTION)].length,
  };
}

function rounded(number: number) {
  return Math.round(number * 100) / 100;
}

function scoreGeo(html: string) {
  const $ = load(html);
  $("script,style,template,noscript,svg,nav,aside,form,button,[hidden],[aria-hidden='true'],[role='navigation'],[role='banner'],[role='contentinfo']").remove();
  $("header,footer").filter((_, node) => !$(node).closest("main,[role='main'],article").length).remove();
  let scope = $("main,[role='main']").first();
  if (!scope.text().trim()) scope = $("article").first();
  if (!scope.text().trim()) scope = $("body");
  scope.find(`${HEADING},${PARAGRAPH},div,section,li,dt,th,td`).before(" ").after(" ");
  scope.find("br").replaceWith(" ");
  const text = clean(scope.text());
  const words = new Intl.Segmenter(undefined, { granularity: "word" });
  const sentences = new Intl.Segmenter(undefined, { granularity: "sentence" });
  const wordCount = (value: string) => {
    let count = 0;
    for (const part of words.segment(value)) if (part.isWordLike) count++;
    return count;
  };
  const headingText = new Map<string, number>();
  const passages: { heading: string | null; text: string; words: number; directAnswer: boolean; selfContained: boolean }[] = [];
  let heading: string | null = null;
  const addPassage = (passage: string) => {
    const count = wordCount(passage);
    if (count < 5) return;
    const firstSentence = sentences.segment(passage)[Symbol.iterator]().next().value?.segment ?? passage;
    const selfContained = !DEPENDENT_START.test(firstSentence);
    const firstEvidence = evidence(firstSentence);
    const direct = ANSWER.test(firstSentence) || firstEvidence.measurements > 0 || firstEvidence.standards > 0;
    passages.push({ heading, text: passage, words: count, directAnswer: selfContained && direct, selfContained });
  };
  scope.find(`${HEADING},${PARAGRAPH}`).each((_, element) => {
    const node = $(element);
    if (node.closest("table,li").length) return;
    const passage = clean(node.text());
    if (node.is(HEADING)) {
      heading = passage || null;
      if (heading) headingText.set(heading, (headingText.get(heading) ?? 0) + 1);
      return;
    }
    if (!node.parents(PARAGRAPH).length && passage) addPassage(passage);
  });
  if (!passages.length && !scope.find("table,ul,ol,dl").length) addPassage(text);

  const tables = scope.find("table").toArray().map((element) => {
    const table = $(element);
    const rows = table.find("tr").filter((_, row) => $(row).closest("table").get(0) === element);
    const dataRows = rows.filter((_, row) =>
      $(row).children("td,th").length >= 2 && $(row).children("td").length > 0).length;
    const labeledRows = rows.filter((_, row) => $(row).children("th").length > 0).length;
    return { dataRows, labeled: labeledRows > 0 || clean(table.children("caption").text()) !== "" };
  }).filter(({ dataRows }) => dataRows > 0);
  const lists = scope.find("ul,ol,dl").toArray().map((element) => {
    const list = $(element);
    const children = list.is("dl") ? list.children("dt") : list.children("li");
    return children.filter((_, item) => clean($(item).text()) !== "").length;
  }).filter((count) => count >= 2);

  const blocks = passages.filter(({ directAnswer }) => directAnswer);
  const wordTotal = wordCount(text);
  const found = evidence(text);
  const numberOfSignals = found.measurements + found.standards + found.attributions;
  const density = 100 * numberOfSignals / Math.max(100, wordTotal);
  const readableSentences = passages.flatMap((passage) => [...sentences.segment(passage.text)])
    .map(({ segment }) => wordCount(segment)).filter((count) => count >= 3);
  const short = readableSentences.filter((count) => count >= 5 && count <= 30).length;
  const sentenceClarity = short / Math.max(1, readableSentences.length);
  const selfContained = passages.filter((passage) => passage.selfContained).length / Math.max(1, passages.length);
  const distinctHeadings = headingText.size / Math.max(1, [...headingText.values()].reduce((sum, count) => sum + count, 0));

  const breakdown = {
    directAnswers: { score: rounded(30 * blocks.length / Math.max(1, passages.length)), max: 30 },
    structure: { score: Math.min(25, 4 * tables.length + 2 * tables.filter(({ labeled }) => labeled).length +
      Math.min(8, tables.reduce((sum, table) => sum + table.dataRows, 0)) + Math.min(10, 2 * lists.length) +
      Math.min(4, headingText.size)), max: 25 },
    evidence: { score: rounded(Math.min(25, 4 * density + 3 * Math.min(2, found.standards) + 2 * Math.min(2, found.attributions))), max: 25 },
    clarity: { score: rounded(wordTotal ? 10 * sentenceClarity + 7 * selfContained + 3 * distinctHeadings : 0), max: 20 },
  };
  const excerpts = blocks.map((block) => {
    const found = evidence(block.text);
    const signals = found.measurements + found.standards + found.attributions;
    return { heading: block.heading, excerpt: block.text.slice(0, 360), words: block.words, evidenceSignals: signals };
  }).sort((a, b) => b.evidenceSignals - a.evidenceSignals).slice(0, 5);

  return {
    score: rounded(Object.values(breakdown).reduce((sum, part) => sum + part.score, 0)),
    breakdown,
    signals: {
      words: wordTotal, proseBlocks: passages.length, directAnswerBlocks: blocks.length,
      directAnswerRatio: rounded(blocks.length / Math.max(1, passages.length)),
      tables: tables.length, labeledTables: tables.filter(({ labeled }) => labeled).length,
      tableDataRows: tables.reduce((sum, table) => sum + table.dataRows, 0), lists: lists.length,
      listItems: lists.reduce((sum, count) => sum + count, 0), ...found, evidencePer100Words: rounded(density),
    },
    excerpts,
  };
}

export const scoreGeoTool = defineTool({
  name: "seokit_score_geo",
  label: "Score page citability",
  description: "Estimate AI citability from HTML main content using direct-answer blocks, table and list structure, data and standards, and linguistic clarity. Returns a heuristic score from 0 to 100 and the observed signals.",
  parameters: Type.Object({ html: Type.String({ maxLength: MAX_HTML_BYTES }) }, { additionalProperties: false }),
  outputSchema: objectOutput,
  annotations: { readOnlyHint: true, openWorldHint: false },
  async execute(_id, { html }) {
    return analysisResult(scoreGeo(html));
  },
});
