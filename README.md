# seokit

seokit 是面向 B2B 制造业独立站和外贸网站的 [Pi](https://pi.dev/) SEO/GEO 工具包，适用于工业品供应商、OEM/ODM 工厂和 B2B 品牌。它把项目档案、技术审计、采购关键词规划和内容制作放进同一项目工作区，以目标市场、买家任务和可核验的产品证据为基础。

核心工作流无需额外的第三方 API 凭证、Python、数据库或自建服务。扩展使用 TypeScript，运行依赖随 Pi 的 Git 安装流程安装。公开网页抓取和搜索需要网络，生成报告和草稿需要 Pi 中已配置的模型。DataForSEO 是可选的数据来源。

## 安装

从 GitHub 安装后，在要分析的站点项目目录启动 Pi。`codemode` 用于把完整 HTML 在抓取、解析和评分工具之间传递。

```bash
pi install git:github.com/sujians/seokit
cd /path/to/your/site-project
pi --tools +codemode
```

本地开发时，在 seokit 仓库根目录安装依赖并把绝对路径链接给 Pi。Pi 从该目录加载扩展、Skill 和命令模板。

```bash
npm ci
pi install "$PWD"
```

## 项目工作区

以下路径都相对于启动 Pi 时所在的项目目录，由对应工作流按需创建。

| 目录 | 文件和用途 |
| --- | --- |
| `profile/` | `profile.yaml` 保存项目、市场、产品、供应能力和证据。可选的 `.env` 保存 DataForSEO 配置，请在站点项目的 `.gitignore` 中排除 `profile/.env`。 |
| `clusters/` | 每个主题保存 `<keyword-slug>-clusters.yaml` 和 `<keyword-slug>-clusters.md`，记录关键词、买家意图、目标页和内链。 |
| `audits/` | 保存 SEO/GEO 审计、竞品拆解和按需内嵌 Schema 的报告。 |
| `drafts/` | 保存 Markdown 草稿、本地化稿、对比稿、已校验的 JSON-LD 和 `llms.txt` 草稿。 |

## 9 个 Skill 与 8 个命令

| Skill | Pi 命令 | 产出 |
| --- | --- | --- |
| [`profile`](skills/profile/SKILL.md) | `/seokit-init [url]` | 经确认并校验的 `profile/profile.yaml`。 |
| [`seo-audit`](skills/seo-audit/SKILL.md) | `/seokit-audit <url>` | 页面、索引、结构化数据及采购证据审计，保存为 `audits/<domain>-<date>.md`。 |
| [`seo-keyword-cluster`](skills/seo-keyword-cluster/SKILL.md) | `/seokit-cluster <topic> [csv]` | 按采购任务分组，生成 Hub/Spoke 与内链计划，保存至 `clusters/`。 |
| [`seo-brief`](skills/seo-brief/SKILL.md) | `/seokit-article <topic>` | 研究目标市场和竞品，编写产品、工艺、选型对比或采购指南的 Brief。 |
| [`seo-write`](skills/seo-write/SKILL.md) | `/seokit-article <topic>` | 接续 Brief，核验证据并自检可引用性，保存为 `drafts/<slug>.md`。 |
| [`seo-localize`](skills/seo-localize/SKILL.md) | `/seokit-translate <file> <locale>` | 按本地采购意图重写并附 hreflang 建议，保存为 `drafts/<slug>.<locale>.md`。 |
| [`seo-geo`](skills/seo-geo/SKILL.md) | `/seokit-geo [url]` | 核对 AI 爬虫规则、可引用性与实体证据，保存 `audits/<slug>-geo.md`。站点身份和链接核实后生成 `drafts/llms.txt`。 |
| [`seo-schema`](skills/seo-schema/SKILL.md) | `/seokit-schema <url_or_draft> [draft_publish_url]` | 核验公开页或本地草稿中的事实，保存已通过工具校验的 `drafts/<slug>-schema.jsonld`。 |
| [`seo-competitor`](skills/seo-competitor/SKILL.md) | `/seokit-competitor <keyword_or_url> [url ...] [--vs 或 --alternatives]` | 拆解 1–3 个竞品页面，保存 `audits/<slug>-competitor.md`。可选生成 `drafts/<slug>-vs-draft.md`。 |

## DataForSEO 配置和费用

可选服务提供指定国家和语言的 Google Ads 搜索量与 CPC、Google 自然搜索排名，以及域名反链概览。用 DataForSEO 后台的 API 登录名和 API 密码填写 `profile/.env`，也可以将相同变量传给 Pi 进程。每个变量优先取进程环境。

```dotenv
DATAFORSEO_LOGIN=your_api_login
DATAFORSEO_PASSWORD=your_api_password
DATAFORSEO_SANDBOX=1
```

- **沙盒模式**。设置 `DATAFORSEO_SANDBOX=1` 后，请求发往 `sandbox.dataforseo.com`，仍需 API 凭据，预估费用为 USD 0。返回的样例数据适合集成测试。生产查询使用 `DATAFORSEO_SANDBOX=0` 或移除该变量。 [DataForSEO 沙盒文档](https://docs.dataforseo.com/v3/appendix-sandbox/)
- **请求前估算**。三个 DataForSEO 工具均支持 `dry_run: true`，可离线检查凭据是否齐全并查看整批估算。生产批次估算超过 USD 0.50 时，Pi 会在发送首个请求前展示总额和逐项明细，等用户确认。拒绝、取消或会话无法确认时，该批次不会发送。估算不超过 USD 0.50 的生产批次可直接发送，仍可能计费。
- **公开数据回退**。缺少实时数据时，关键词与内容规划可使用公开搜索、网页抓取和已有 CSV。竞品拆解可直接使用用户提供的公开 URL。

在代理网络下，启动 Pi 前设置 `HTTPS_PROXY` 或 `HTTP_PROXY`，并按需用 `NO_PROXY` 指定例外。seokit 的抓取和 DataForSEO 工具会读取这些代理变量。可同时执行 `export NODE_USE_ENV_PROXY=1`，让支持该变量的 Node.js 网络调用使用环境代理。

## 快速开始

把示例域名换成自己的公开站点。在 `/seokit-init` 的访谈中确认目标市场、内容语言、产品范围及可核实的资料，再在同一工作区依次运行以下命令。`/seokit-geo` 省略 URL 时使用档案中的站点地址。

```text
/seokit-init https://www.example.com
/seokit-cluster "stainless steel enclosures"
/seokit-article "stainless steel enclosure selection guide"
/seokit-geo
```

集群计划用于确定先做哪些页面。文章命令可复用主题、市场和语言匹配的计划。GEO 命令检查公开页面，并依据已验证的链接起草 `llms.txt`。

## 发布前自检

在 seokit 仓库根目录运行。若 Node 无法直接导入 Pi SDK，将 `PI_SDK_ENTRY` 指向已安装 Pi 包的 `dist/index.js`（绝对路径）。Smoke 测试加载 Pi 扩展、Skill 和命令，检查工作区与旧路径引用，模拟 DataForSEO 请求，并默认抓取 `https://schema.org/Product` 验证分析工具。

```bash
npm ci
node scripts/smoke-seokit.mjs
npm pack --dry-run
```
