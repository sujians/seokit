# seokit Development Guide

## Positioning

`seokit` is a universal SEO/GEO Pi package focused on B2B manufacturing, industrial products, and export websites (suppliers, OEM/ODM factories, B2B brands).
All research, audits, and content must be grounded in target market, buyer intent, industry terminology, and verifiable product evidence.

## Architecture & Conventions

1. Follow official Pi package conventions (`extensions/`, `skills/`, `prompts/`). Always verify current Pi extension APIs against Pi's built-in docs before writing code.
2. TypeScript first: implement core tools (`fetch_page`, `parse_seo`, `validate_schema`, `score_geo`, optional `dataforseo`) in `extensions/seokit/` with zero Python dependency for core usage.
3. Lightweight state: store per-project data in `.seokit/` (`profile.yaml`, `clusters.yaml`, `audits/`). Never build a heavy vault or database.
4. Progressive skills: keep each `SKILL.md` concise and move detailed checklists/templates into `references/`.
5. `_refs/` contains source repositories (`claude-seo`, `geo-seo-claude`, `claude-blog`) for domain logic reference ONLY. Never copy files verbatim.

## Planned Modules

- **Skills**: `profile`, `seo-audit`, `seo-keyword-cluster`, `seo-geo`, `seo-schema`, `seo-brief`, `seo-write`, `seo-localize`, `seo-competitor`
- **Optional Data Provider**: `dataforseo` (Keywords Data, SERP, Backlinks only). Enabled via `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD`, must include cost-estimation confirmation before batch calls, and gracefully degrade to web scraping / user CSV import when unconfigured.

## Hard Exclusions (Do NOT Port)

- `claude-blog/brain/` (Obsidian vault, Quartz site, curators, historical JSON snapshots)[cite: 3].
- Local brick-and-mortar SEO / GBP (`seo-local`, `seo-maps`, GBP prompts)[cite: 1].
- Agency CRM / Flask webapp / white-label proposals (`geo-seo-claude` webapp & crm)[cite: 2].
- Unrelated third-party wrappers (`shopify`, `banana`, `posthog`, `matomo`, `profound`, `seranking`, `unlighthouse`, `dataforseo_merchant`)[cite: 1].
- Claude-specific `.claude-plugin/` manifests and fragmented sub-agent files[cite: 1].

## Evidence & Source Policy

- **Industry & Technical Facts**: Actively use web search/fetch to verify standards (ISO/ASTM/IEC/UL/FDA), material properties, and market data, and cite authoritative public sources.
- **First-Party Company Claims**: Only state company-specific specs, tolerances, certifications, MOQs, lead times, or capacities if verified in `.seokit/profile.yaml` or provided by the user. If `.seokit/profile.yaml` does not exist, write as an objective industry guide or insert `[TODO: add company proof]` where brand evidence is needed.
