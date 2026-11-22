import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const sdk = process.env.PI_SDK_ENTRY;
const { DefaultResourceLoader } = await import(sdk
  ? pathToFileURL(resolve(sdk)).href : "@earendil-works/pi-coding-agent");
const cwd = await mkdtemp(join(tmpdir(), "seokit-smoke-"));
try {
  const loader = new DefaultResourceLoader({
    cwd,
    agentDir: cwd,
    additionalExtensionPaths: [fileURLToPath(new URL("../extensions/seokit/index.ts", import.meta.url))],
    noExtensions: true,
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    noContextFiles: true,
  });
  await loader.reload();
  const { extensions, errors } = loader.getExtensions();
  assert.deepEqual(errors, []);
  const tools = extensions.flatMap((extension) => [...extension.tools.values()]);
  const run = async (name, args) => {
    const tool = tools.find(({ definition }) => definition.name === name)?.definition;
    assert.ok(tool, `${name} was not registered`);
    const result = await tool.execute(`smoke-${name}`, args, undefined, undefined, { cwd });
    assert.ok(!result.isError, `${name} returned an error`);
    assert.ok(result.structuredContent, `${name} did not return structured output`);
    return result.structuredContent;
  };

  const page = await run("seokit_fetch_page", { url: process.argv[2] ?? "https://schema.org/Product" });
  assert.ok(page.status >= 200 && page.status < 300 && page.html && !page.truncated);
  assert.ok(Array.isArray(page.redirects) && page.headers["content-type"]);
  assert.ok(page.robots.status && page.llms.status, "Expected HTTP responses from both root files");
  assert.ok(page.robots.bots.some(({ userAgent }) => userAgent === "GPTBot"));
  const seo = await run("seokit_parse_seo", { url: page.url, html: page.html });
  assert.ok(seo.title && seo.headings.length > 0 && seo.jsonLd.length > 0, "Use a page with headings and JSON-LD");
  const schema = await run("seokit_validate_schema", { blocks: seo.jsonLd.map(({ raw }) => raw) });
  assert.equal(schema.blocksChecked, seo.jsonLd.length);
  assert.ok(schema.nodesChecked > 0, "Expected JSON-LD nodes to be checked");
  const geo = await run("seokit_score_geo", { html: page.html });
  assert.ok(geo.score >= 0 && geo.score <= 100 && geo.signals.words > 0);
  console.log(`PASS ${page.status} ${page.url}\nrobots.txt ${page.robots.status} · llms.txt ${page.llms.status}`);
  console.log(`${seo.title} · ${seo.headings.length} headings · ${schema.blocksChecked} JSON-LD blocks · ${schema.issues.length} schema findings · GEO ${geo.score}/100`);
} finally {
  await rm(cwd, { recursive: true, force: true });
}
