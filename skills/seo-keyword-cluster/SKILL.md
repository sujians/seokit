---
name: seo-keyword-cluster
description: Plan keyword clusters and hub-and-spoke page architecture for B2B manufacturing, industrial products, and export websites. Import a supplied keyword CSV, map buyer intent to pages, and save a prioritized plan and Markdown summary under clusters/.
---

# Topic Clusters for B2B Manufacturing and Export Sites

1. Try `seokit_load_profile({})` first. Follow [research and import](references/research-and-import.md) to extract applicable product lines, markets, languages, buyer roles, certification scope, and terminology. Use generic mode on missing or invalid profiles or tool failure. Prefer facts confirmed by the user for this task and mark missing company evidence `[TODO: add company proof]`.
2. Parse a supplied CSV with `seokit_read_keyword_csv` before expanding candidates. Check [optional DataForSEO data](references/research-and-import.md#optional-dataforseo-data) and prefer live, market-specific volumes and organic rankings when available. Supplement gaps with public search, fetched pages, or imported CSV. Group by product, buyer task, and market-language scope. Use search evidence and existing pages to decide which terms share a page. Mark grouping without comparable SERPs as provisional.
3. Apply the [B2B buyer intent matrix](references/buyer-intent-matrix.md) to assign terms, tasks, page types, and priorities. Set each product or category hub's role before assigning specification, process, application, comparison, or procurement spokes. Check existing URLs and keyword ownership within the same scope. Reuse pages that meet the task.
4. Follow the [hub-and-spoke linking rules](references/hub-spoke-links.md) for reciprocal links, related content, and inquiry paths. Check for orphan pages, duplicate target terms, role conflicts, and publication dependencies.
5. Follow the [output specification](references/plan-output.md) for slug generation and editing `clusters/<keyword-slug>-clusters.yaml`. Generate `clusters/<keyword-slug>-clusters.md` from the same plan. Preserve other topics and other market-language clusters. Verify the saved files and link endpoints, then report paths, priority pages, and open checks.
