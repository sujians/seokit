import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { MAX_HTML_BYTES, analysisResult, objectOutput } from "./result.js";

const GOOGLE_2025 = "https://developers.google.com/search/blog/2025/06/simplifying-search-results";
const HOW_TO_RETIREMENT = "https://developers.google.com/search/blog/2023/08/howto-faq-changes";
const RETIRED = new Map([
  ["HowTo", HOW_TO_RETIREMENT],
  ["CourseInfo", GOOGLE_2025], ["ClaimReview", GOOGLE_2025], ["EstimatedSalary", GOOGLE_2025],
  ["OccupationalAggregateRating", GOOGLE_2025], ["LearningVideo", GOOGLE_2025],
  ["SpecialAnnouncement", GOOGLE_2025], ["VehicleListing", GOOGLE_2025], ["Vehicle", GOOGLE_2025],
  ["PracticeProblem", "https://developers.google.com/search/blog/2025/11/update-on-our-efforts"],
]);
const ORGANIZATION_TYPES = new Set([
  "Organization", "Corporation", "LocalBusiness", "OnlineBusiness", "OnlineStore", "NGO", "ResearchOrganization",
]);

type JsonObject = Record<string, unknown>;
type Issue = {
  block: number;
  path: string;
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  source?: string;
};

type Report = Omit<Issue, "block">;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonempty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function values(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value == null ? [] : [value];
}

function typeNames(value: unknown): string[] {
  return values(value).filter(nonempty).map((name) => name.replace(/^(?:https?:\/\/schema\.org\/|schema:)/, ""));
}

function hasTypedValue(value: unknown, accepts: (type: string) => boolean): boolean {
  if (!isObject(value)) return false;
  const types = typeNames(value["@type"]);
  return types.length ? types.some(accepts) : nonempty(value["@id"]);
}

function isWebUrl(value: unknown): boolean {
  if (!nonempty(value)) return false;
  try {
    return /^https?:$/.test(new URL(value).protocol);
  } catch {
    return false;
  }
}

function auditFields(node: JsonObject, types: string[], path: string, report: (issue: Report) => void) {
  if (types.includes("Product")) {
    const additional = values(node.additionalProperty);
    if (!additional.length || !additional.every((item) => hasTypedValue(item, (type) => type === "PropertyValue") &&
      isObject(item) && (nonempty(item["@id"]) ||
        ((nonempty(item.name) || nonempty(item.propertyID)) && item.value != null &&
          item.value !== "" && (!Array.isArray(item.value) || item.value.length > 0))))) {
      report({ path: `${path}.additionalProperty`, severity: "warning", code: "product-additional-property",
        message: "Use PropertyValue nodes with a name or propertyID and a value, or reference them by @id. Add verified industrial specifications where applicable.",
        source: "https://schema.org/additionalProperty" });
    }
    const manufacturers = values(node.manufacturer);
    if (!manufacturers.length || !manufacturers.every((item) => hasTypedValue(item, (type) => ORGANIZATION_TYPES.has(type)))) {
      report({ path: `${path}.manufacturer`, severity: "warning", code: "product-manufacturer",
        message: "Identify the verified manufacturer with an Organization node or @id reference.",
        source: "https://schema.org/manufacturer" });
    }
    const certifications = values(node.hasCertification);
    if (!certifications.length || !certifications.every((item) => hasTypedValue(item, (type) => type === "Certification"))) {
      report({ path: `${path}.hasCertification`, severity: certifications.length ? "warning" : "info", code: "product-certification",
        message: "Use Certification nodes or @id references for applicable, verified certifications.", source: "https://schema.org/hasCertification" });
    }
  }
  if (types.some((type) => ORGANIZATION_TYPES.has(type))) {
    const links = values(node.sameAs);
    if (!links.length || !links.every(isWebUrl)) {
      report({ path: `${path}.sameAs`, severity: links.length ? "warning" : "info", code: "organization-same-as",
        message: "Use absolute HTTP(S) URLs for verified profiles or external records that identify this organization.",
        source: "https://schema.org/sameAs" });
    }
  }
}

function auditBlock(source: string, block: number, issues: Issue[], allowHowTo: boolean) {
  const report = (issue: Report) => issues.push({ block, ...issue });
  let root: unknown;
  try {
    root = JSON.parse(source.replace(/^\uFEFF/, ""));
  } catch (error) {
    report({ path: "$", severity: "error", code: "json-syntax", message: error instanceof Error ? error.message : String(error) });
    return 0;
  }

  const roots = Array.isArray(root) ? root.map((value: unknown, index) => ({ value, path: `$[${index}]` })) : [{ value: root, path: "$" }];
  const pending = [] as { value: JsonObject; path: string }[];
  for (const { value, path } of roots) {
    if (isObject(value)) {
      pending.push({ value, path });
      if (value["@context"] == null) report({ path, severity: "warning", code: "missing-context", message: "Declare the JSON-LD context for this top-level node." });
    } else {
      report({ path, severity: "error", code: "jsonld-root", message: "A JSON-LD document must contain an object or an array of objects." });
    }
  }

  let nodesChecked = 0;
  while (pending.length) {
    const { value, path } = pending.pop()!;
    const rawTypes = value["@type"];
    const types = typeNames(rawTypes);
    if (rawTypes !== undefined && (!types.length || !values(rawTypes).every(nonempty))) {
      report({ path: `${path}.@type`, severity: "error", code: "invalid-type", message: "@type must be a string or an array of nonempty strings." });
    }
    for (const type of new Set(types)) {
      const source = RETIRED.get(type);
      if (type === "HowTo" && allowHowTo) report({ path: `${path}.@type`, severity: "info", code: "retired-howto-rich-result",
        message: "HowTo is accepted as Schema.org markup. Google removed the HowTo rich result in September 2023.", source: HOW_TO_RETIREMENT });
      else if (source) report({ path: `${path}.@type`, severity: "error", code: "retired-rich-result", message: `${type} is blocked by the SEO policy for retired Google rich results.`, source });
      if (type === "FAQPage") report({ path: `${path}.@type`, severity: "info", code: "retired-faq-rich-result",
        message: "Google removed the FAQ rich result in May 2026.", source: "https://developers.google.com/search/updates#removing-faq-rich-result" });
    }
    if (types.length) {
      nodesChecked++;
      auditFields(value, types, path, report);
    }
    if ("@graph" in value && !isObject(value["@graph"]) &&
      !(Array.isArray(value["@graph"]) && value["@graph"].every(isObject))) {
      report({ path: `${path}.@graph`, severity: "error", code: "invalid-graph", message: "@graph must contain an object or an array of objects." });
    }
    for (const [key, item] of Object.entries(value)) {
      if (key === "@context" || key === "@value") continue;
      if (isObject(item)) pending.push({ value: item, path: `${path}.${key}` });
      if (Array.isArray(item)) item.forEach((child: unknown, index) => {
        if (isObject(child)) pending.push({ value: child, path: `${path}.${key}[${index}]` });
      });
    }
  }
  return nodesChecked;
}

export const validateSchemaTool = defineTool({
  name: "seokit_validate_schema",
  label: "Validate JSON-LD for SEO",
  description: "Check raw JSON-LD blocks for JSON syntax, retired Google rich-result types, and B2B Product and Organization fields. Public prices are optional for inquiry products. Pass blocks from seokit_parse_seo or a generated draft.",
  parameters: Type.Object({
    blocks: Type.Array(Type.String({ maxLength: MAX_HTML_BYTES })),
    allowHowTo: Type.Optional(Type.Boolean({ description: "Accept HowTo as Schema.org markup and report its retired Google rich result as information. Defaults to false." })),
  }, { additionalProperties: false }),
  outputSchema: objectOutput,
  annotations: { readOnlyHint: true, openWorldHint: false },
  async execute(_id, { blocks, allowHowTo = false }) {
    const issues: Issue[] = [];
    const nodesChecked = blocks.reduce((count, block, index) => count + auditBlock(block, index, issues, allowHowTo), 0);
    return analysisResult({
      valid: issues.every(({ severity }) => severity !== "error"),
      blocksChecked: blocks.length,
      nodesChecked,
      issues,
    });
  },
});
