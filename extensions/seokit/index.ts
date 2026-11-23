import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Type, type TSchema } from "typebox";
import { Value } from "typebox/value";
import { parse, parseDocument } from "yaml";
import { dataForSeoBacklinksTool, dataForSeoKeywordsTool, dataForSeoSerpTool } from "./providers/dataforseo.js";
import { checkRobotsTool, fetchPageTool } from "./tools/fetch-page.js";
import { parseSeoTool } from "./tools/parse-seo.js";
import { readKeywordCsvTool } from "./tools/read-keyword-csv.js";
import { scoreGeoTool } from "./tools/score-geo.js";
import { validateSchemaTool } from "./tools/validate-schema.js";

const schemaUrl = new URL("../../skills/profile/references/profile-schema.yaml", import.meta.url);

export default function (pi: ExtensionAPI) {
  pi.registerTool(fetchPageTool);
  pi.registerTool(checkRobotsTool);
  pi.registerTool(parseSeoTool);
  pi.registerTool(readKeywordCsvTool);
  pi.registerTool(validateSchemaTool);
  pi.registerTool(scoreGeoTool);
  pi.registerTool(dataForSeoKeywordsTool);
  pi.registerTool(dataForSeoSerpTool);
  pi.registerTool(dataForSeoBacklinksTool);

  pi.registerTool({
    name: "seokit_load_profile",
    label: "Load SEO project profile",
    description: "Read and validate profile/profile.yaml in the current project. Returns the validated profile as JSON.",
    parameters: Type.Object({}, { additionalProperties: false }),
    async execute(_toolCallId, _params, signal, _onUpdate, ctx) {
      const path = join(ctx.cwd, "profile", "profile.yaml");
      let source: string;
      try {
        source = await readFile(path, { encoding: "utf8", signal });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          throw new Error(`Profile not found at ${path}. Run /seokit-init to create it.`);
        }
        throw error;
      }

      let profile: unknown;
      try {
        const document = parseDocument(source, { stringKeys: true });
        const issue = document.errors[0] ?? document.warnings[0];
        if (issue) throw issue;
        profile = document.toJS();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid YAML in ${path}: ${message}`);
      }

      const schema = parse(await readFile(schemaUrl, { encoding: "utf8", signal })) as TSchema;
      const errors = Value.Errors(schema, profile);
      if (errors.length) {
        const problems = errors.map(({ instancePath, message }) => `- ${instancePath || "/"}: ${message}`);
        throw new Error(`Invalid profile at ${path}:\n${problems.join("\n")}`);
      }

      return {
        content: [{ type: "text", text: JSON.stringify(profile, null, 2) }],
        details: { path, profile },
      };
    },
  });
}
