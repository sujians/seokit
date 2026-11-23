---
name: seo-brief
description: Build a research-backed B2B manufacturing content brief from competitor search results, project evidence, and buyer intent. Use for product pages, process capability pages, selection comparisons, and procurement guides.
---

# B2B Technical and Procurement Content Brief

1. Set the research scope. Reuse the verified project profile or call `seokit_load_profile({})`. Use the target term, `markets`, `buyer_personas`, `product_lines`, and glossary to identify the buyer, market, language, and decision. If the profile is missing, invalid, or unrelated, continue in generic mode and record assumptions and limitations. Find any matching topic and market-language page plan in `clusters/*-clusters.yaml`.
2. Read the [SERP gap analysis and brief schema](references/serp-gap-and-brief-schema.md). Search the primary term and significant buyer-task variants in the target market. Select the top 3–5 relevant organic results. Use `seokit_fetch_page` and `seokit_parse_seo` as shown in the reference and verify body H2s and procurement evidence. Record actual coverage and outstanding evidence when the sample is limited.
3. Choose one of the [four B2B page templates](references/page-type-templates.md) using the requested page type and buyer task. Map observed gaps, PAA questions, procurement objections, 2–3 first-party factory evidence slots, tables and visuals, and cluster links to an actionable H2/H3 outline. List sources to check for public facts, and match company claims to profile fields or user materials. Mark missing proof `[Factory evidence needed: specific material and scope]`.
4. Deliver a complete Markdown brief with all nine sections. Check that each high-priority recommendation maps to an outline section and has evidence or a verification note. Return the full brief for review when used independently. In the article workflow, pass it to `seo-write` and include it in the delivery response.
