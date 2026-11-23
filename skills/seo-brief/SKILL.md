---
name: seo-brief
description: Build and save a research-backed brief for a new or existing B2B manufacturing page. Use for industrial product pages, process capability pages, selection comparisons, and procurement guides.
---

# B2B Technical and Procurement Content Brief

1. **Read the profile and cluster.** Reuse a validated profile or call `seokit_load_profile({})`. Establish the product or process, market, language, buyer role, and procurement decision. Use the matching page and links in `clusters/*-clusters.yaml`. Record missing or mismatched context and continue in generic mode when the profile is unusable. Choose create or update mode from the target URL, cluster, and request.
2. **Research and inspect the leading results.** Follow [SERP, gap, and terminology research](references/serp-gap-and-research.md) to scope queries, select 3–5 relevant organic pages, and run `seokit_fetch_page` and `seokit_parse_seo`. Verify main-content headings, evidence, formats, and comparable length. In update mode, inspect the current page and identify sections to retain, strengthen, or add.
3. **Choose the page type and the new value.** Apply the appropriate [B2B page template](references/page-type-templates.md). Use the observed buyer intent, gaps, and feasible evidence to select a specific information gain. Plan the terms, procurement objections, section budgets, and assets needed to support it.
4. **Build the brief.** Use the [brief output template](references/brief-output-template.md) to produce the complete Markdown, including metadata, internal links, the H2/H3 outline, public and factory evidence, and recommended Schema.org types.
5. **Check, save, and hand off.** Run the template's delivery checklist, then save `drafts/<slug>-brief.md` and read it back. Share the path and open evidence. Give `seo-write` the saved brief for drafting and `seo-schema` the type recommendations and their prerequisites when markup is requested. Keep the saved brief available even if a downstream draft is blocked.
