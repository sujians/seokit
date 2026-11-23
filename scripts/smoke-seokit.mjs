import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
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
const promptPaths = {
  "seokit-init": "profile/profile.yaml",
  "seokit-cluster": "clusters/<keyword-slug>-clusters.yaml",
  "seokit-audit": "audits/<domain>-<date>.md",
  "seokit-article": "drafts/<slug>.md",
  "seokit-translate": "drafts/<slug>.<locale>.md",
};
try {
  const loader = new DefaultResourceLoader({
    cwd,
    agentDir: cwd,
    additionalExtensionPaths: [repoPath("extensions/seokit/index.ts")],
    additionalPromptTemplatePaths: Object.keys(promptPaths).map((name) => repoPath(`prompts/${name}.md`)),
    noExtensions: true,
    noSkills: true,
    noThemes: true,
    noContextFiles: true,
  });
  await loader.reload();
  const { extensions, errors } = loader.getExtensions();
  assert.deepEqual(errors, []);
  const tools = extensions.flatMap((extension) => [...extension.tools.values()]);
  const ctx = { cwd, hasUI: false };
  const invoke = async (name, args) => {
    const tool = tools.find(({ definition }) => definition.name === name)?.definition;
    assert.ok(tool, `${name} was not registered`);
    const result = await tool.execute(`smoke-${name}`, args, undefined, undefined, ctx);
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

  const { prompts, diagnostics } = loader.getPrompts();
  assert.deepEqual(diagnostics, []);
  for (const [name, path] of Object.entries(promptPaths)) {
    assert.ok(prompts.find((prompt) => prompt.name === name)?.content.includes(path), `${name} should use ${path}`);
  }
  assert.ok(prompts.find(({ name }) => name === "seokit-cluster").content.includes("clusters/<keyword-slug>-clusters.md"));
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
  assert.equal(topicSlug("不锈钢 工业机箱"), "不锈钢-工业机箱");
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
  console.log("PASS project profile, topic plans, audits, drafts, translations and CSV import");

  await checkDataForSeo(invoke, writeFile);
  console.log("PASS DataForSEO credentials and Google goto resolution (mock API and GET requests)");

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

async function checkDataForSeo(invoke, writeFile) {
  const loginKey = "DATAFORSEO_LOGIN";
  const passwordKey = "DATAFORSEO_PASSWORD";
  const keys = [loginKey, passwordKey, "https_proxy", "HTTPS_PROXY", "http_proxy", "HTTP_PROXY"];
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
  const runProvider = async (name, params) => {
    const result = await invoke(`seokit_dataforseo_${name}`, params);
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
    await checkGoogleGoto(mock, runProvider, market);
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

async function checkGoogleGoto(mock, runProvider, market) {
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
    organic(6, "https://direct.example/page", { domain: "direct.example" }),
  ];
  mock.enableCallHistory();
  mock.get("https://api.dataforseo.com")
    .intercept({ path: "/v3/serp/google/organic/live/regular", method: "POST" })
    .reply(200, { status_code: 20000, cost: 0.002, tasks: [{ status_code: 20000, result: [{ items }] }] });
  const search = mock.get(google);
  search.intercept({ path: redirect, method: "GET", headers: { "user-agent": /seokit/ } })
    .reply(302, "", { headers: { location: redirectTarget } });
  search.intercept({ path: challenge, method: "GET" }).reply(200, "Verification page");
  mock.get(regionalGoogle).intercept({ path: rateLimited, method: "GET" }).reply(429, "Too many requests");

  const result = await runProvider("serp", { ...market, keywords: ["enclosures"], top_n: 6 });
  assert.equal(result.status, "ok");
  mock.assertNoPendingInterceptors();
  assert.deepEqual(result.results[0].organic.map(({ rank, url, domain, unresolved_goto }) => [rank, url, domain, unresolved_goto]), [
    [1, "https://www.example.com/products?size=12#specs", "example.com", undefined],
    [2, `${google}${challenge}`, "parts.example", true],
    [3, "https://www.example.com/products?size=12#specs", "example.com", undefined],
    [4, `${regionalGoogle}${rateLimited}`, "metals.example", true],
    [5, `${regionalGoogle}${rateLimited}`, "Fixture Fabrication", true],
    [6, "https://direct.example/page", "direct.example", undefined],
  ]);
  const calls = mock.getCallHistory().calls();
  assert.equal(calls.filter(({ method }) => method === "POST").length, 1);
  assert.deepEqual(calls.filter(({ method }) => method !== "POST").map(({ method, fullUrl }) => `${method} ${fullUrl}`).sort(), [
    `GET ${google}${challenge}`,
    `GET ${google}${redirect}`,
    `GET ${regionalGoogle}${rateLimited}`,
  ].sort());
}
