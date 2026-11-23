import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runInNewContext } from "node:vm";
import { getGlobalDispatcher, MockAgent, setGlobalDispatcher } from "undici";
import { parse } from "yaml";

const sdk = process.env.PI_SDK_ENTRY;
const { DefaultResourceLoader, createReadToolDefinition, createWriteToolDefinition } = await import(sdk
  ? pathToFileURL(resolve(sdk)).href : "@earendil-works/pi-coding-agent");
const cwd = await mkdtemp(join(tmpdir(), "seokit-smoke-"));
const repoPath = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const skillNames = [
  "profile", "seo-audit", "seo-keyword-cluster", "seo-brief", "seo-write", "seo-localize",
  "seo-geo", "seo-schema", "seo-competitor",
];
const promptPaths = {
  "seokit-init": "profile/profile.yaml",
  "seokit-cluster": "clusters/<keyword-slug>-clusters.yaml",
  "seokit-audit": "audits/<domain>-<date>.md",
  "seokit-geo": "audits/<slug>-geo.md",
  "seokit-schema": "drafts/<slug>-schema.jsonld",
  "seokit-article": "drafts/<slug>.md",
  "seokit-translate": "drafts/<slug>.<locale>.md",
  "seokit-competitor": "audits/<slug>-competitor.md",
};
try {
  assert.ok((await readFile(repoPath("README.md"), "utf8")).trim(), "README.md should contain release documentation");
  for (const name of skillNames) assert.ok((await readFile(repoPath(`skills/${name}/SKILL.md`), "utf8")).trim());
  for (const name of Object.keys(promptPaths)) assert.ok((await readFile(repoPath(`prompts/${name}.md`), "utf8")).trim());
  const contentReferences = {
    "seo-brief": ["serp-gap-and-research.md", "brief-output-template.md", "page-type-templates.md"],
    "seo-write": ["b2b-writing-and-anti-slop.md", "geo-citation-and-qa.md"],
  };
  for (const [skill, names] of Object.entries(contentReferences)) {
    const skillPath = `skills/${skill}`;
    const instructions = await readFile(repoPath(`${skillPath}/SKILL.md`), "utf8");
    for (const name of names) {
      const reference = `references/${name}`;
      assert.ok(instructions.includes(`](${reference})`), `${skill} should link to ${reference}`);
      const path = `${skillPath}/${reference}`;
      const guidance = await readFile(repoPath(path), "utf8");
      assert.ok(guidance.trim(), `${path} should contain guidance`);
      assert.ok(!guidance.includes("\0"), `${path} should be Markdown text`);
    }
  }
  await checkWriterHandoff();
  await checkWorkspacePaths();

  const loader = new DefaultResourceLoader({
    cwd,
    agentDir: cwd,
    additionalExtensionPaths: [repoPath(".")],
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
  const ctx = { cwd, hasUI: false };
  const invoke = async (name, args, context = ctx) => {
    const tool = tools.find(({ definition }) => definition.name === name)?.definition;
    assert.ok(tool, `${name} was not registered`);
    const result = await tool.execute(`smoke-${name}`, args, undefined, undefined, context);
    assert.ok(!result.isError, `${name} returned an error`);
    return result;
  };
  const run = async (name, args) => {
    const result = await invoke(name, args);
    assert.ok(result.structuredContent, `${name} did not return structured output`);
    return result.structuredContent;
  };
  const write = createWriteToolDefinition(cwd);
  const read = createReadToolDefinition(cwd);
  const writeFile = (path, content) => write.execute("smoke-write", { path, content }, undefined, undefined, ctx);
  const readBack = async (path) => (await read.execute("smoke-read", { path }, undefined, undefined, ctx)).content[0].text;

  const { skills, diagnostics: skillDiagnostics } = loader.getSkills();
  assert.deepEqual(skillDiagnostics, []);
  assert.deepEqual(skills.map(({ name }) => name).sort(), [...skillNames].sort());
  const { prompts, diagnostics } = loader.getPrompts();
  assert.deepEqual(diagnostics, []);
  assert.deepEqual(prompts.map(({ name }) => name).sort(), Object.keys(promptPaths).sort());
  for (const [name, path] of Object.entries(promptPaths)) {
    assert.ok(prompts.find((prompt) => prompt.name === name)?.content.includes(path), `${name} should use ${path}`);
  }
  assert.ok(prompts.find(({ name }) => name === "seokit-cluster").content.includes("clusters/<keyword-slug>-clusters.md"));
  const articlePrompt = prompts.find(({ name }) => name === "seokit-article").content;
  for (const instruction of ["drafts/<slug>-brief.md", "seo-write", "seokit_score_geo", "factory measurement evidence"]) {
    assert.ok(articlePrompt.includes(instruction), `seokit-article should carry ${instruction} into the draft handoff`);
  }
  console.log(`PASS README, ${skills.length} skills, ${prompts.length} prompts, content references and workspace paths`);
  await assert.rejects(invoke("seokit_load_profile", {}), /Profile not found .*profile[/\\]profile\.yaml/);
  const profileFile = promptPaths["seokit-init"];
  const profileYaml = "schema_version: 1\nproject:\n  name: Smoke project\n";
  await writeFile(profileFile, profileYaml);
  const profile = await invoke("seokit_load_profile", {});
  assert.deepEqual(profile.details, { path: join(cwd, profileFile), profile: parse(profileYaml) });

  const planReference = await readFile(repoPath("skills/seo-keyword-cluster/references/plan-output.md"), "utf8");
  const slugSource = planReference.match(/```js\n([\s\S]*?)\n```/)[1];
  const topicSlug = runInNewContext(`${slugSource}\ntopicSlug`, {}, { timeout: 1000 });
  assert.equal(topicSlug(" ../STAINLESS Steel\\Enclosures: "), "stainless-steel-enclosures");
  assert.equal(topicSlug("\u4e0d\u9508\u94a2 \u5de5\u4e1a\u673a\u7bb1"), "\u4e0d\u9508\u94a2-\u5de5\u4e1a\u673a\u7bb1");
  assert.equal(topicSlug("../.."), "topic");
  assert.equal(topicSlug("a".repeat(100)).length, 48);
  const fixturePlan = planReference.match(/```yaml\n([\s\S]*?)\n```/)[1];
  const plan = parse(fixturePlan);
  assert.equal(plan.schema_version, 1);
  const slug = topicSlug(plan.topic);
  const markdown = `# ${plan.topic}\n`;
  const files = {
    [`clusters/${slug}-clusters.yaml`]: fixturePlan,
    [`clusters/${slug}-clusters.md`]: markdown,
    "clusters/welding-clusters.yaml": "schema_version: 1\ntopic: Welding\nclusters: []\n",
    "clusters/welding-clusters.md": "# Welding\n",
    "audits/schema.org-2026-01-15.md": "# Smoke audit\n",
    "audits/schema-org-product-geo.md": "# Smoke GEO audit\n",
    "drafts/llms.txt": "# Smoke project\n\n## Products\n\n- [Product](https://schema.org/Product)\n",
    [`drafts/${slug}-brief.md`]: `# Content Brief: ${plan.topic}
`,
    [`drafts/${slug}.md`]: markdown,
    [`drafts/${slug}.de-DE.md`]: "# Edelstahlgehäuse\n",
  };
  for (const [path, content] of Object.entries(files)) await writeFile(path, content);
  const planPath = `clusters/${slug}-clusters.yaml`;
  files[planPath] = fixturePlan.replace("2026-01-15", "2026-01-16");
  await writeFile(planPath, files[planPath]);
  for (const [path, content] of Object.entries(files)) assert.equal(await readBack(path), content);
  const keyword = "Stainless Steel Enclosures";
  await writeFile("keywords.csv", `keyword,volume\n${keyword},0\n`);
  const csv = await run("seokit_read_keyword_csv", { path: "keywords.csv" });
  assert.deepEqual(csv.rows, [{ recordNumber: 1, keyword, volume: "0" }]);
  const localizedKeyword = "\u4e0d\u9508\u94a2\u673a\u7bb1";
  const localizedHeaders = "\u5173\u952e\u8bcd,\u641c\u7d22\u91cf";
  await writeFile("keywords-zh.csv", localizedHeaders + "\n" + localizedKeyword + ",0\n");
  const localizedCsv = await run("seokit_read_keyword_csv", { path: "keywords-zh.csv" });
  assert.deepEqual(localizedCsv.rows, [{ recordNumber: 1, keyword: localizedKeyword, volume: "0" }]);

  const localizedHtml = "<main><p>\u4e0d\u9508\u94a2\u673a\u7bb1\u9002\u7528\u4e8e\u6237\u5916\u8bbe\u5907\u3002\u6839\u636e\u4ea7\u54c1\u56fe\u7eb8\uff0c\u677f\u6750\u539a\u5ea6\u4e3a 2 \u6beb\u7c73\u3002</p></main>";
  const localizedGeo = await run("seokit_score_geo", { html: localizedHtml });
  assert.equal(localizedGeo.signals.directAnswerBlocks, 1);
  assert.equal(localizedGeo.signals.measurements, 1);
  assert.equal(localizedGeo.signals.attributions, 1);
  console.log("PASS project profile, topic plans, audits, briefs, drafts, translations and multilingual CSV and GEO inputs");

  const answer = "Enclosure fit requires checking the mounting pattern and usable interior depth against the approved drawing. Compare the mounting hole locations and the space reserved for cable bends, with connectors in place. According to the approved drawing, use its revision for both checks and request a fit review if either condition is unclear.";
  const answerWords = [...new Intl.Segmenter("en", { granularity: "word" }).segment(answer)]
    .filter(({ isWordLike }) => isWordLike).length;
  assert.ok(answerWords >= 40 && answerWords <= 60);
  const draftGeo = await run("seokit_score_geo", { html: `<main>
    <h1>Enclosure fit checks</h1><h2>Mounting pattern and depth</h2><p>${answer}</p>
    <table><thead><tr><th>Check</th><th>Acceptance basis</th></tr></thead>
    <tbody><tr><td>Mounting hole locations</td><td>Approved drawing revision</td></tr></tbody></table>
  </main>` });
  assert.equal(draftGeo.signals.labeledTables, 1);
  assert.equal(draftGeo.signals.tableDataRows, 1);
  assert.equal(draftGeo.signals.directAnswerBlocks, 1);
  assert.equal(draftGeo.signals.attributions, 1);
  console.log("PASS brief-to-writer checklist, Chinese editorial strings and GEO draft signals");

  const howTo = JSON.stringify({ "@context": "https://schema.org", "@type": "HowTo" });
  const validate = (blocks, options) => run("seokit_validate_schema", { blocks, ...options });
  const defaultHowTo = await validate([howTo]);
  assert.equal(defaultHowTo.valid, false);
  assert.equal(defaultHowTo.issues[0].code, "retired-rich-result");
  const allowedHowTo = await validate([howTo], { allowHowTo: true });
  assert.equal(allowedHowTo.valid, true);
  assert.equal(allowedHowTo.issues[0].code, "retired-howto-rich-result");
  const retiredClaimReview = howTo.replace("HowTo", "ClaimReview");
  assert.equal((await validate([retiredClaimReview], { allowHowTo: true })).valid, false);
  assert.equal((await validate(["{invalid"], { allowHowTo: true })).valid, false);

  await checkDataForSeo(invoke, writeFile);
  console.log("PASS DataForSEO credentials, live cost gate, sandbox routing and Google goto resolution (mocked)");

  const page = await run("seokit_fetch_page", { url: process.argv[2] ?? "https://schema.org/Product" });
  assert.ok(page.status >= 200 && page.status < 300 && page.html && !page.truncated);
  assert.ok(Array.isArray(page.redirects) && page.headers["content-type"]);
  assert.ok(page.robots.status && page.llms.status, "Expected HTTP responses from both root files");
  assert.ok(page.robots.bots.some(({ userAgent }) => userAgent === "GPTBot"));
  const robots = await run("seokit_check_robots", { url: page.url });
  const target = new URL(page.url);
  assert.equal(robots.targetUrl, page.url);
  assert.equal(robots.testedPath, target.pathname + target.search);
  assert.ok(robots.bots.some(({ userAgent }) => userAgent === "OAI-SearchBot"));
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

async function checkWriterHandoff() {
  const [brief, qa, guidance] = await Promise.all([
    readFile(repoPath("skills/seo-brief/references/brief-output-template.md"), "utf8"),
    readFile(repoPath("skills/seo-write/references/geo-citation-and-qa.md"), "utf8"),
    readFile(repoPath("skills/seo-write/references/b2b-writing-and-anti-slop.md"), "utf8"),
  ]);
  const briefSections = Array.from(brief.matchAll(/^### (\d+\. .+)$/gm), ([, section]) => section);
  const reviewedSections = Array.from(qa.matchAll(/^\| (\d+\. .+?) \|/gm), ([, section]) => section);
  assert.ok(briefSections.length > 0);
  assert.deepEqual(reviewedSections, briefSections, "Writer QA should check every numbered brief section in order");
  const localizedSource = guidance.match(/```js\n([\s\S]*?)\n```/u)?.[1];
  assert.ok(localizedSource, "Writer guidance should contain the Chinese editorial strings");
  const { chinesePhrases, chineseFactoryPlaceholder } = runInNewContext(
    `${localizedSource}\n;({ chinesePhrases, chineseFactoryPlaceholder })`, {}, { timeout: 1000 },
  );
  assert.equal(chineseFactoryPlaceholder, "[\u5f85\u5de5\u5382\u8865\u5145: \u5177\u4f53\u7f3a\u5931\u9879]");
  for (const group of ["opening", "superiority", "promise"]) {
    assert.ok(chinesePhrases[group].length >= 3);
    assert.ok(chinesePhrases[group].every((phrase) => /^\p{Script=Han}+$/u.test(phrase)));
  }
}

async function checkWorkspacePaths(directory = repoPath(".")) {
  const excludedDirectories = new Set([".git", "_refs", "node_modules"]);
  const legacyPath = ".seokit" + "/";
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !excludedDirectories.has(entry.name)) await checkWorkspacePaths(path);
    if (entry.isFile() && entry.name !== ".env" && !entry.name.endsWith(".log")) {
      const file = await readFile(path);
      assert.ok(!file.includes(legacyPath), `${path} contains a legacy workspace path`);
    }
  }
}

async function checkDataForSeo(invoke, writeFile) {
  const loginKey = "DATAFORSEO_LOGIN";
  const passwordKey = "DATAFORSEO_PASSWORD";
  const sandboxKey = "DATAFORSEO_SANDBOX";
  const keys = [loginKey, passwordKey, sandboxKey, "https_proxy", "HTTPS_PROXY", "http_proxy", "HTTP_PROXY", "NODE_USE_ENV_PROXY"];
  const savedEnv = keys.map((key) => process.env[key]);
  const dispatcher = getGlobalDispatcher();
  const mock = new MockAgent();
  mock.disableNetConnect();
  setGlobalDispatcher(mock);
  for (const key of keys) delete process.env[key];

  const fileLogin = "fresh-fixture@example.test";
  const filePassword = "file#fixture = password";
  const envLogin = "process-fixture@example.test";
  const envPassword = "process-fixture-secret";
  const secrets = [fileLogin, filePassword, envLogin, envPassword];
  const market = { location: 2840, language_code: "en" };
  const args = { queries: [{ ...market, keywords: ["enclosures"] }] };
  const runProvider = async (name, params, context) => {
    const result = await invoke(`seokit_dataforseo_${name}`, params, context);
    assert.ok(secrets.every((secret) => !JSON.stringify(result).includes(secret)), "Provider exposed credentials");
    return result.structuredContent;
  };
  const pool = mock.get("https://api.dataforseo.com");
  const request = async (login, password, status = 200) => {
    const authorization = `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
    pool.intercept({ path: "/v3/keywords_data/google_ads/search_volume/live", method: "POST", headers: { authorization } })
      .reply(status, status === 200
        ? { status_code: 20000, cost: 0.09, tasks: [{ status_code: 20000, result: [] }] }
        : { status_message: `${login} ${password}` });
    const result = await runProvider("keywords", args);
    mock.assertNoPendingInterceptors();
    assert.equal(result.status, status === 200 ? "ok" : "request_failed");
  };

  try {
    const absent = await runProvider("keywords", args);
    assert.equal(absent.status, "not_configured");
    assert.deepEqual(absent.missingEnv, [loginKey, passwordKey]);
    assert.match(absent.configuration, /profile\/\.env/);
    await writeFile("profile/.env", `\uFEFF# Fixture\r\nexport ${loginKey} = ${fileLogin} # comment\r\n${passwordKey} = '${filePassword}'\r\n`);
    for (const [name, params, cost] of [
      ["keywords", args, 0.09],
      ["serp", { ...market, keywords: ["enclosures"] }, 0.002],
      ["backlinks", { domains: ["example.com"] }, 0.024036],
    ]) {
      const result = await runProvider(name, { ...params, dry_run: true });
      assert.equal(result.status, "dry_run");
      assert.equal(result.available, true);
      assert.equal(result.estimate.totalUsd, cost);
    }
    await request(fileLogin, filePassword);
    assert.equal(process.env[loginKey], undefined);
    assert.equal(process.env[passwordKey], undefined);
    process.env[loginKey] = envLogin;
    await request(envLogin, filePassword);
    delete process.env[loginKey];
    process.env[passwordKey] = envPassword;
    await request(fileLogin, envPassword);
    process.env[loginKey] = envLogin;
    await request(envLogin, envPassword);
    await request(envLogin, envPassword, 401);
    await checkGoogleGotoSession(mock, runProvider, market);
    await checkGoogleGoto(mock, runProvider, market);
    await checkGoogleGotoRedirects(mock, runProvider, market);
    await checkDataForSeoModes(mock, runProvider, writeFile, market);
    process.env[loginKey] = "";
    assert.deepEqual((await runProvider("keywords", args)).missingEnv, [loginKey]);
  } finally {
    for (const [index, key] of keys.entries()) {
      if (savedEnv[index] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[index];
    }
    setGlobalDispatcher(dispatcher);
    await mock.close();
  }
}

async function checkDataForSeoModes(mock, runProvider, writeFile, market) {
  const sandboxKey = "DATAFORSEO_SANDBOX";
  const queries = Array.from({ length: 6 }, (_, index) => ({ ...market, keywords: [`enclosures ${index}`] }));
  const params = { queries };
  const path = "/v3/keywords_data/google_ads/search_volume/live";
  mock.enableCallHistory();
  mock.clearCallHistory();
  const history = () => mock.getCallHistory()?.calls() ?? [];

  const liveEstimate = await runProvider("keywords", { ...params, dry_run: true });
  assert.equal(liveEstimate.sandbox, false);
  assert.equal(liveEstimate.estimate.totalUsd, 0.54);
  assert.equal(liveEstimate.estimate.requiresConfirmation, true);
  assert.equal((await runProvider("keywords", params)).status, "confirmation_required");
  let confirmationMessage;
  const context = {
    cwd,
    hasUI: true,
    ui: { confirm: async (_title, message) => {
      confirmationMessage = message;
      return false;
    } },
  };
  assert.equal((await runProvider("keywords", params, context)).status, "declined");
  assert.match(confirmationMessage, /\$0\.54 USD for 6 API requests/);
  assert.equal(history().length, 0);
  const live = mock.get("https://api.dataforseo.com");
  live.intercept({ path, method: "POST" }).reply(200, {
    status_code: 20000, cost: 0.09, tasks: [{ status_code: 20000, result: [] }],
  }).times(queries.length);
  context.ui.confirm = async () => {
    assert.equal(history().length, 0);
    return true;
  };
  const approved = await runProvider("keywords", params, context);
  assert.equal(approved.status, "ok");
  assert.equal(approved.reportedCostUsd, 0.54);
  assert.equal(history().length, queries.length);
  mock.clearCallHistory();

  await writeFile("profile/.env", `${sandboxKey}=1\n`);
  const sandboxEstimate = await runProvider("keywords", { ...params, dry_run: true });
  assert.equal(sandboxEstimate.sandbox, true);
  assert.equal(sandboxEstimate.estimate.totalUsd, 0);
  assert.equal(sandboxEstimate.estimate.requiresConfirmation, false);
  assert.ok(sandboxEstimate.estimate.tasks.every(({ estimatedUsd }) => estimatedUsd === 0));
  assert.equal(history().length, 0);
  const sandboxOrigin = "https://sandbox.dataforseo.com";
  const sandbox = mock.get(sandboxOrigin);
  sandbox.intercept({ path, method: "POST" }).reply(200, {
    status_code: 20000, cost: 0, tasks: [{ status_code: 20000, result: [] }],
  }).times(queries.length);
  const sandboxBatch = await runProvider("keywords", params);
  assert.equal(sandboxBatch.status, "ok");
  assert.equal(sandboxBatch.sandbox, true);
  assert.equal(sandboxBatch.reportedCostUsd, 0);
  assert.deepEqual(history().map(({ fullUrl }) => fullUrl), Array(queries.length).fill(sandboxOrigin + path));
  mock.clearCallHistory();

  const serpPath = "/v3/serp/google/organic/live/regular";
  const items = [{ type: "organic", rank_group: 1, url: "https://www.google.com/goto?url=sample" }];
  sandbox.intercept({ path: serpPath, method: "POST" }).reply(200, {
    status_code: 20000, cost: 0, tasks: [{ status_code: 20000, result: [{ items }] }],
  });
  const serp = await runProvider("serp", { ...market, keywords: ["enclosures"] });
  assert.equal(serp.results[0].organic[0].goto_resolve_error, "sandbox_sample");
  assert.deepEqual(history().map(({ fullUrl }) => fullUrl), [sandboxOrigin + serpPath]);
  sandbox.intercept({ path, method: "POST" }).reply(503, {});
  const failed = await runProvider("keywords", params);
  assert.equal(failed.status, "request_failed");
  assert.deepEqual(history().map(({ fullUrl }) => fullUrl), [sandboxOrigin + serpPath, sandboxOrigin + path]);

  process.env[sandboxKey] = "0";
  assert.equal((await runProvider("keywords", params)).status, "confirmation_required");
  process.env[sandboxKey] = "1";
  await writeFile("profile/.env", "# Sandbox mode now comes from the process environment\n");
  assert.equal((await runProvider("keywords", { ...params, dry_run: true })).sandbox, true);
  mock.assertNoPendingInterceptors();
  mock.disableCallHistory();
}

async function checkGoogleGotoSession(mock, runProvider, market) {
  mock.enableCallHistory();
  const apex = "https://google.com";
  const www = "https://www.google.com";
  const initialPath = "/goto?url=CAESopaque%2f%3d&gsessionid=session%2Bvalue&extra=a%20b&extra=c+d";
  const nextPath = "/goto?gsessionid=session%2Bvalue&url=CAESother%2b%3d&extra=%7e&extra=~";
  const target = "https://www.example.com/product?size=12&srsltid=tracking&spec=a%20b&%73rsltid=duplicate#specs";
  const timeoutPath = "/goto?url=CAEStimeout&gsessionid=session%2Bvalue";
  const items = [
    { type: "organic", rank_group: 1, url: `${apex}${initialPath}`, domain: "google.com" },
    { type: "organic", rank_group: 2, url: `${www}${timeoutPath}`, domain: "google.com" },
  ];
  const headers = { "user-agent": "Mozilla/5.0", connection: "close" };
  mock.get("https://api.dataforseo.com")
    .intercept({ path: "/v3/serp/google/organic/live/regular", method: "POST" })
    .reply(200, { status_code: 20000, cost: 0.002, tasks: [{ status_code: 20000, result: [{ items }] }] });
  const google = mock.get(www);
  const requestTimes = [];
  const reply = (path, statusCode, location) => google.intercept({ path, method: "GET", headers }).reply(() => {
    requestTimes.push(performance.now());
    return { statusCode, responseOptions: { headers: location ? { location } : {} } };
  });
  reply(initialPath, 400).delay(100);
  reply(initialPath, 429);
  reply(initialPath, 302, `${www}${nextPath}`);
  reply(nextPath, 303, target);
  reply(timeoutPath, 302, "https://too-late.example/").delay(11_000);
  reply(timeoutPath, 302, "https://recovered.example/parts?srsltid=tracking");

  const result = await runProvider("serp", { ...market, keywords: ["enclosures"] });
  assert.equal(result.status, "ok");
  const [row, recovered] = result.results[0].organic;
  assert.equal(row.url, "https://www.example.com/product?size=12&spec=a%20b#specs");
  assert.equal(row.domain, "example.com");
  assert.equal(row.unresolved_goto, undefined);
  assert.equal(recovered.url, "https://recovered.example/parts");
  assert.equal(recovered.unresolved_goto, undefined);
  assert.deepEqual(mock.getCallHistory().calls().filter(({ method }) => method === "GET").map(({ fullUrl }) => fullUrl), [
    `${www}${initialPath}`,
    `${www}${initialPath}`,
    `${www}${initialPath}`,
    `${www}${nextPath}`,
    `${www}${timeoutPath}`,
    `${www}${timeoutPath}`,
  ]);
  const [first, retry, secondRetry, hop, timeoutStart, timeoutRetry] = requestTimes;
  assert.ok(retry - first >= 2_095, "400 retry started less than 2000 ms after the delayed response");
  assert.ok(secondRetry - retry >= 3_995, "429 retry did not wait 4000 ms");
  assert.ok(hop - secondRetry >= 795, "Google redirect did not wait 800 ms");
  assert.ok(timeoutStart - hop >= 795, "The next link did not wait 800 ms");
  assert.ok(timeoutRetry - timeoutStart >= 11_995, "Timeout retry did not allow 10000 ms and a 2000 ms backoff");
  mock.assertNoPendingInterceptors();
}

async function checkGoogleGoto(mock, runProvider, market) {
  mock.clearCallHistory();
  const google = "https://www.google.com";
  const regionalGoogle = "https://www.google.co.uk";
  const redirect = "/goto?url=CAESredirect";
  const challenge = "/goto?url=CAESchallenge";
  const rateLimited = "/goto?url=CAESrateLimited";
  const redirectTarget = "https://www.Example.com/products?srsltid=abc&size=12&srsltid=def#specs";
  const organic = (rank_group, url, fields = {}) => ({ type: "organic", rank_group, url, domain: "google.com", ...fields });
  const items = [
    organic(7, "/goto?url=CAESoutsideTopN"),
    organic(4, `${regionalGoogle}${rateLimited}`, { breadcrumb: "www.metals.example › Materials" }),
    { type: "paid", rank_group: 1, url: "/goto?url=CAESpaid" },
    organic(2, `${google}${challenge}`, { breadcrumb: "https://www.parts.example/en › Parts", website_name: "Other name" }),
    organic(3, `${google}${redirect}`),
    organic(1, redirect),
    organic(5, `${regionalGoogle}${rateLimited}`, { breadcrumb: "... › Catalog", website_name: "Fixture Fabrication" }),
    organic(6, "https://WWW.Direct.Example./page?srsltid=server&spec=a%20b&%73rsltid=duplicate#parts", { domain: "stale.example" }),
  ];
  mock.enableCallHistory();
  mock.get("https://api.dataforseo.com")
    .intercept({ path: "/v3/serp/google/organic/live/regular", method: "POST" })
    .reply(200, { status_code: 20000, cost: 0.002, tasks: [{ status_code: 20000, result: [{ items }] }] });
  const search = mock.get(google);
  search.intercept({ path: redirect, method: "GET", headers: { "user-agent": "Mozilla/5.0" } })
    .reply(302, "", { headers: { location: redirectTarget } });
  search.intercept({ path: challenge, method: "GET" }).reply(200, "Verification page");
  mock.get(regionalGoogle).intercept({ path: rateLimited, method: "GET" }).reply(429, "Too many requests").times(3);

  const result = await runProvider("serp", { ...market, keywords: ["enclosures"], top_n: 6 });
  assert.equal(result.status, "ok");
  mock.assertNoPendingInterceptors();
  const rows = result.results[0].organic;
  assert.deepEqual(rows.map(({ rank, url, domain, goto_resolve_error }) => [rank, url, domain, goto_resolve_error]), [
    [1, "https://www.example.com/products?size=12#specs", "example.com", undefined],
    [2, `${google}${challenge}`, "parts.example", "http_200_no_redirect"],
    [3, "https://www.example.com/products?size=12#specs", "example.com", undefined],
    [4, `${regionalGoogle}${rateLimited}`, "metals.example", "http_429"],
    [5, `${regionalGoogle}${rateLimited}`, "Fixture Fabrication", "http_429"],
    [6, "https://www.direct.example./page?spec=a%20b#parts", "direct.example", undefined],
  ]);
  assert.deepEqual(rows.filter(({ unresolved_goto }) => unresolved_goto).map(({ rank }) => rank), [2, 4, 5]);
  assert.match(rows[3].goto_resolve_hint, /HTTPS_PROXY/);
  const calls = mock.getCallHistory().calls();
  const posts = calls.filter(({ method }) => method === "POST");
  assert.equal(posts.length, 1);
  assert.equal(JSON.parse(posts[0].body)[0].resolve_goto_urls, true);
  assert.deepEqual(calls.filter(({ method }) => method !== "POST").map(({ method, fullUrl }) => `${method} ${fullUrl}`).sort(), [
    `GET ${google}${challenge}`,
    `GET ${google}${redirect}`,
    `GET ${regionalGoogle}${rateLimited}`,
    `GET ${regionalGoogle}${rateLimited}`,
    `GET ${regionalGoogle}${rateLimited}`,
  ].sort());
}

async function checkGoogleGotoRedirects(mock, runProvider, market) {
  mock.clearCallHistory();
  const google = "https://www.google.com";
  const regionalGoogle = "https://google.co.uk";
  const expectedGets = [];
  const get = (origin, path) => {
    expectedGets.push(`${origin}${path}`);
    return mock.get(origin).intercept({ path, method: "GET" });
  };
  const redirect = (origin, path, location) => get(origin, path).reply(302, "", { headers: { location } });
  const inputs = ["chain", "refresh", "canonical", "sorry", "limit", "network", "loop"];
  const paths = inputs.map((input) => `/goto?url=CAES${input}`);
  const [chain, refresh, canonical, sorry, limit, network, loop] = paths;
  redirect(google, chain, "/url?hop=1");
  redirect(google, "/url?hop=1", `${regionalGoogle}/url?hop=2`);
  redirect(regionalGoogle, "/url?hop=2", "?hop=3");
  redirect(regionalGoogle, "/url?hop=3", "https://www.example.com/chain?srsltid=remove#end");
  get(google, refresh).reply(200, `<meta content="0; URL='//www.example.com/refresh?x=1&amp;srsltid=remove'" http-equiv="Refresh">`);
  get(google, canonical).reply(200, `<link href="https://www.example.com/canonical?srsltid=remove" rel="Canonical">`);
  redirect(google, sorry, "/sorry/index?continue=x");
  redirect(google, limit, "/url?limit=1");
  for (let hop = 1; hop <= 3; hop++) redirect(google, `/url?limit=${hop}`, `/url?limit=${hop + 1}`);
  get(google, network).replyWithError(Object.assign(new Error("mock-network-private-detail"), { code: "ECONNRESET" }));
  redirect(google, loop, `${loop}#same-request`);

  const payload = [{ location_code: market.location, language_code: market.language_code, keyword: "enclosures", depth: 10, device: "desktop", resolve_goto_urls: false }];
  const items = [
    ...paths.map((url, index) => ({ type: "organic", rank_group: index + 1, url, domain: "google.com" })),
    { type: "organic", rank_group: paths.length + 1, url: "https://provider.example/", domain: "provider.example" },
  ];
  mock.get("https://api.dataforseo.com")
    .intercept({ path: "/v3/serp/google/organic/live/regular", method: "POST", body: JSON.stringify(payload) })
    .reply(200, { status_code: 20000, cost: 0.002, tasks: [{ status_code: 20000, result: [{ items }] }] });
  const args = { ...market, keywords: ["enclosures"], resolve_goto_urls: false };
  const dryRun = await runProvider("serp", { ...args, dry_run: true });
  assert.equal(dryRun.estimate.totalUsd, 0.002);
  assert.deepEqual(mock.getCallHistory().calls(), []);
  process.env.NODE_USE_ENV_PROXY = "1";
  const result = await runProvider("serp", args);
  assert.equal(result.status, "ok");
  mock.assertNoPendingInterceptors();
  const rows = result.results[0].organic;
  assert.deepEqual(rows.map(({ url, goto_resolve_error }) => [url, goto_resolve_error]), [
    ["https://www.example.com/chain#end", undefined],
    ["https://www.example.com/refresh?x=1", undefined],
    ["https://www.example.com/canonical", undefined],
    [sorry, "google_sorry"],
    [limit, "still_google_redirect"],
    [network, "network_error: ECONNRESET"],
    [loop, "still_google_redirect"],
    ["https://provider.example/", undefined],
  ]);
  assert.ok(rows.slice(3, 7).every(({ unresolved_goto, domain }) => unresolved_goto && domain === null));
  assert.match(rows[5].goto_resolve_hint, /NODE_USE_ENV_PROXY=1.*HTTPS_PROXY/);
  assert.ok(!JSON.stringify(result).includes("mock-network-private-detail"));
  const calls = mock.getCallHistory().calls();
  assert.equal(calls.filter(({ method }) => method === "POST").length, 1);
  assert.deepEqual(calls.filter(({ method }) => method !== "POST").map(({ method, fullUrl }) => `${method} ${fullUrl}`).sort(),
    expectedGets.map((url) => `GET ${url}`).sort());
}
