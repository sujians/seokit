# seokit Development Guide

## Positioning

`seokit` is a universal SEO/GEO Pi package focused on B2B manufacturing, industrial products, and export websites (suppliers, OEM/ODM factories, B2B brands).
All research, audits, and content must be grounded in target market, buyer intent, industry terminology, and verifiable product evidence.

## Architecture & Conventions

Use English in repository-maintained documentation, instructions, examples, code comments, and tool messages. Workflows may handle multilingual inputs and generate content in the requested locale.

1. Follow official Pi package conventions (`extensions/`, `skills/`, `prompts/`). Always verify current Pi extension APIs against Pi's built-in docs before writing code.
2. TypeScript first: implement core tools (`fetch_page`, `parse_seo`, `validate_schema`, `score_geo`, optional `dataforseo`) in `extensions/seokit/` with zero Python dependency for core usage.
3. Lightweight state: store the project profile at `profile/profile.yaml`, topic plans under `clusters/`, audit reports under `audits/`, and working drafts under `drafts/`. Never build a heavy vault or database.
4. Progressive skills: keep each `SKILL.md` concise and move detailed checklists/templates into `references/`.
5. `_refs/` contains source repositories (`claude-seo`, `geo-seo-claude`, `claude-blog`) for domain logic reference ONLY. Never copy files verbatim.

## Skills and commands

| Skill | Prompt template |
| --- | --- |
| `profile` | `/seokit-init` |
| `seo-audit` | `/seokit-audit` |
| `seo-keyword-cluster` | `/seokit-cluster` |
| `seo-brief` | `/seokit-article` (research and brief) |
| `seo-write` | `/seokit-article` (draft and review) |
| `seo-localize` | `/seokit-translate` |
| `seo-geo` | `/seokit-geo` |
| `seo-schema` | `/seokit-schema` |
| `seo-competitor` | `/seokit-competitor` |

The optional `dataforseo` provider covers Keywords Data, SERP, and Backlinks summaries. Read `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`, and `DATAFORSEO_SANDBOX` from the process environment first, then from `profile/.env` per variable. Keep credentials out of Git. Use `dry_run` for offline estimates and require Pi confirmation before sending a live batch estimated above USD 0.50. Sandbox responses are sample data. Use public research or supplied CSVs when live provider data is unavailable.

## Hard Exclusions (Do NOT Port)

- `claude-blog/brain/` (Obsidian vault, Quartz site, curators, historical JSON snapshots)[cite: 3].
- Local brick-and-mortar SEO / GBP (`seo-local`, `seo-maps`, GBP prompts)[cite: 1].
- Agency CRM / Flask webapp / white-label proposals (`geo-seo-claude` webapp & crm)[cite: 2].
- Unrelated third-party wrappers (`shopify`, `banana`, `posthog`, `matomo`, `profound`, `seranking`, `unlighthouse`, `dataforseo_merchant`)[cite: 1].
- Claude-specific `.claude-plugin/` manifests and fragmented sub-agent files[cite: 1].

## Evidence & Source Policy

- **Industry & Technical Facts**: Actively use web search/fetch to verify standards (ISO/ASTM/IEC/UL/FDA), material properties, and market data, and cite authoritative public sources.
- **First-Party Company Claims**: Only state company-specific specs, tolerances, certifications, MOQs, lead times, or capacities if verified in `profile/profile.yaml` or provided by the user. If `profile/profile.yaml` does not exist, write as an objective industry guide or insert `[TODO: add company proof]` where brand evidence is needed.
