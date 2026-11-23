# seokit

seokit is an SEO/GEO toolkit for [Pi](https://pi.dev/) built for industrial suppliers, OEM/ODM factories, and B2B brands. It brings project profiles, technical audits, procurement keyword planning, and content production into one workspace. Research and drafts use the target market, buyer task, and verifiable product evidence.

The TypeScript extension runs with the dependencies installed by Pi. Core workflows require no API credentials, Python, database, or self-hosted service. Public search and page fetching require network access, and report and draft generation require a model configured in Pi. DataForSEO is optional.

## Installation

Install from GitHub, then start Pi in your site project. Enable Codemode to pass complete HTML between fetching, parsing, and scoring tools.

```bash
pi install git:github.com/sujians/seokit
cd /path/to/your/site-project
pi --tools +codemode
```

For local development, install dependencies at the repository root and link its absolute path to Pi.

```bash
npm ci
pi install "$PWD"
```

## Project workspace

Workflows create these paths as needed, relative to the directory where Pi starts.

| Directory | Contents |
| --- | --- |
| `profile/` | `profile.yaml` stores markets, products, supply capabilities, and evidence. The optional `.env` stores DataForSEO settings. Add `profile/.env` to the site project's `.gitignore`. |
| `clusters/` | `<keyword-slug>-clusters.yaml` and `<keyword-slug>-clusters.md` record keywords, buyer intent, target pages, and internal links by topic. |
| `audits/` | SEO/GEO audits, competitor analyses, and reports with inline schema on request. |
| `drafts/` | Markdown drafts, localized versions, comparisons, validated JSON-LD, and a draft `llms.txt`. |

## Skills and commands

| Skill | Pi command | Output |
| --- | --- | --- |
| [profile](skills/profile/SKILL.md) | `/seokit-init [url]` | Confirmed and validated `profile/profile.yaml`. |
| [seo-audit](skills/seo-audit/SKILL.md) | `/seokit-audit <url>` | Page, index eligibility, structured data, and procurement evidence audit in `audits/<domain>-<date>.md`. |
| [seo-keyword-cluster](skills/seo-keyword-cluster/SKILL.md) | `/seokit-cluster <topic> [csv]` | Buyer-intent clusters with hubs, spokes, and an internal link plan in `clusters/`. |
| [seo-brief](skills/seo-brief/SKILL.md) | `/seokit-article <topic>` | Market and competitor research and a brief for a product, process, comparison, or procurement page. |
| [seo-write](skills/seo-write/SKILL.md) | `/seokit-article <topic>` | Drafts and verifies claims and citability before saving to `drafts/<slug>.md`. |
| [seo-localize](skills/seo-localize/SKILL.md) | `/seokit-translate <file> <locale>` | Localized content and hreflang guidance in `drafts/<slug>.<locale>.md`. |
| [seo-geo](skills/seo-geo/SKILL.md) | `/seokit-geo [url]` | AI crawler, citability, and entity checks in `audits/<slug>-geo.md`, plus `drafts/llms.txt` when site identity and links are verified. |
| [seo-schema](skills/seo-schema/SKILL.md) | `/seokit-schema <url_or_draft> [draft_publish_url]` | Validated JSON-LD in `drafts/<slug>-schema.jsonld`. |
| [seo-competitor](skills/seo-competitor/SKILL.md) | `/seokit-competitor <keyword_or_url> [url ...] [--vs \| --alternatives]` | Analysis of one to three pages in `audits/<slug>-competitor.md` and an optional `drafts/<slug>-vs-draft.md`. |

## DataForSEO configuration and cost

The optional provider supplies country- and language-specific Google Ads volume and CPC, Google organic rankings, and domain backlink summaries. Use your API login and password in `profile/.env` or in Pi's process environment. Process settings take precedence per variable.

```dotenv
DATAFORSEO_LOGIN=your_api_login
DATAFORSEO_PASSWORD=your_api_password
DATAFORSEO_SANDBOX=1
```

- **Sandbox mode.** `DATAFORSEO_SANDBOX=1` routes requests to `sandbox.dataforseo.com`. Credentials are required. Estimated cost is USD 0, and responses contain sample data for testing. Set the variable to `0` or remove it for production queries. [DataForSEO sandbox](https://docs.dataforseo.com/v3/appendix-sandbox/)
- **Cost estimates.** All three provider tools support `dry_run: true` to check configuration and estimate a batch offline. For live batches estimated above USD 0.50, Pi displays the total and per-item estimates and waits for confirmation before sending. Declining, cancelling, or running without an available confirmation interface blocks the batch. Live batches estimated at USD 0.50 or less can run directly and may incur charges.
- **Public research.** If live data is unavailable, use public search, web pages, or a supplied CSV for content and keyword planning. Competitor analysis also accepts public URLs directly.

For a proxy network, set `HTTPS_PROXY` or `HTTP_PROXY` before starting Pi, and use `NO_PROXY` for exceptions. Fetch and DataForSEO tools read those variables. You can also set `NODE_USE_ENV_PROXY=1` for Node.js calls that support it.

## Quick start

Substitute your public site URL. Confirm the markets, languages, products, and available evidence in the profile interview, then run the other commands in the same project. The GEO command uses the profile website if you omit the URL.

```text
/seokit-init https://www.example.com
/seokit-cluster "stainless steel enclosures"
/seokit-article "stainless steel enclosure selection guide"
/seokit-geo
```

The cluster plan prioritizes pages. The article workflow can use a matching topic, market, and language plan. The GEO workflow assesses the public page and uses verified links for the `llms.txt` draft.

## Release checks

Run these commands from the repository root. If Node cannot import the Pi SDK, set `PI_SDK_ENTRY` to the absolute path of `dist/index.js` in your Pi installation. The smoke script loads the extension, skills, and commands, checks workspace paths, mocks DataForSEO, and exercises the analysis tools against `https://schema.org/Product` by default.

```bash
npm ci
node scripts/smoke-seokit.mjs
npm pack --dry-run
```
