# Cluster Plan Output

## Topic filenames

Use `clusters/<keyword-slug>-clusters.yaml` and `clusters/<keyword-slug>-clusters.md` per input topic. Generate a lowercase slug from the topic, keeping Unicode letters, numbers, and combining marks. Replace runs of whitespace, punctuation, and path separators with a single hyphen, limit length, and trim leading and trailing hyphens.

```js
function topicSlug(topic) {
  const normalized = topic.normalize("NFKC").toLowerCase().normalize("NFC");
  const slug = normalized.replace(/[^\p{L}\p{N}\p{M}]+/gu, "-").replace(/^-+|-+$/g, "");
  return Array.from(slug).slice(0, 48).join("").replace(/-+$/, "") || "topic";
}
```

For example, `Stainless Steel Enclosures` becomes `stainless-steel-enclosures`. Check the base slug and numbered files with that prefix before writing. Match the YAML’s top-level `topic` against the input, normalizing only Unicode, case, and whitespace. Reuse the matching pair. If none match, use the first slug with both filenames available, appending `-2`, `-3`, and so on for collisions. Preserve files with unknown ownership. If multiple YAML files match, preserve them and report the conflict.

## Topic YAML

Store `schema_version: 1`, the original input as top-level `topic`, and a `clusters` list for that topic. Each cluster has `id`, `topic`, `markets` (regions or `null`), `language` (language tag or `null`), `profile_mode` (`profile` or `generic`), `updated_at`, `sources`, `pages`, `links`, and `open_questions`. Fill out the example fields below with actual evidence.

```yaml
schema_version: 1
topic: Stainless steel enclosures
clusters:
  - id: en-enclosures
    topic: Stainless steel enclosures
    markets: null
    language: en
    profile_mode: generic
    updated_at: '2026-01-15'
    sources:
      - id: seed
        type: user_seed
        reference: Stainless steel enclosures
    pages:
      - id: en-enclosures-hub
        role: hub
        title: Stainless Steel Enclosures
        primary_keyword: stainless steel enclosures
        secondary_keywords: []
        buyer_intent:
          category: procurement
          stage: BOFU
          task: Shortlist a product family and prepare an RFQ
        page_type: category_procurement
        action: create
        path: /products/stainless-steel-enclosures/
        priority: P1
        priority_reason: Supports procurement and provides access to supporting pages
        grouping_basis: intent_hypothesis
        evidence_refs: [seed]
        verification_needed: ['[TODO: add company proof] Verify the publishable product range and RFQ path']
      - id: en-enclosures-comparison
        role: spoke
        title: 304 vs 316 Stainless Steel Enclosures
        primary_keyword: 304 vs 316 stainless steel enclosure
        secondary_keywords: []
        buyer_intent:
          category: comparison
          stage: MOFU
          task: Select a material for the operating conditions
        page_type: comparison_guide
        action: create
        path: /resources/304-vs-316-stainless-steel-enclosures/
        priority: P2
        priority_reason: Depends on the category page and citable material references
        grouping_basis: intent_hypothesis
        evidence_refs: [seed]
        verification_needed: [Verify comparable material properties and operating conditions]
    links:
      - from: en-enclosures-hub
        to: en-enclosures-comparison
        type: hub_to_spoke
        anchor: Compare 304 and 316 enclosure materials
        placement: Material options section
      - from: en-enclosures-comparison
        to: en-enclosures-hub
        type: spoke_to_hub
        anchor: Explore stainless steel enclosure options
        placement: Product link after selection guidance
    open_questions: [Confirm the target market and dominant SERP page types]
```

- Keep cluster IDs and page IDs unique within their respective types throughout the file. Preserve existing IDs. Use descriptive page types such as `category_procurement`, `product_procurement`, `oem_capability`, `specification`, `process_guide`, `industry_solution`, and `comparison_guide`. Use `procurement`, `engineering`, `application`, or `comparison` for `buyer_intent.category`. Stages are `BOFU`, `MOFU-engineering`, and `MOFU-application` for procurement, engineering, and application respectively. Choose `MOFU` or `BOFU` for comparisons based on the primary task.
- Use `path` for a verified URL, proposed site path, or `null` when unknown. Set `action` to show whether the page will be created, reused, or updated. Set `grouping_basis` to `serp_overlap`, `serp_observation`, or `intent_hypothesis` based on the evidence. Record documentation and launch conditions that need verification. Use optional `excluded_keywords` for terms and reasons.
- Identify `sources` by `id`, `type`, and `reference`. For CSVs, record filenames and record numbers. For pages, record URLs. For SERP comparisons, record query pairs, market, language, device, date, result source, and any supported overlap count. Use `evidence_refs` to reference sources in the cluster. For keyword-level metrics, retain source and period by keyword and market, use `null` for unknowns, and preserve explicit `0` values.
- Put similar markets sharing one URL and language into the same `markets` list. Plan separate paths where query intent or page responsibility differs. Use `null` when the market is unknown and document the verification needed.

## Topic Markdown

Generate Markdown from the complete, validated YAML. Start with each cluster’s topic, market, language, profile mode, CSV coverage, and evidence limits. List every page by cluster and priority with its proposed path or existing URL, primary and secondary terms, buyer task and stage, page type, priority and rationale, and all planned outbound links. Give the destination title or path and include anchor and placement details where needed. Close with the initial implementation order, launch dependencies, and open checks.

## Updating and verifying

1. Select the matching topic file pair and read its YAML. Update clusters for the requested market and language, preserving other clusters in the topic and established page IDs. Remove stale links or specify replacements. Write only the selected pair. If the YAML is malformed, has an unknown version, or matches ambiguously, preserve it and report the conflict.
2. Verify the YAML structure, fields, Hub count, page IDs, keyword ownership, URLs, evidence references, and link endpoints. Check syntax with an available YAML parser such as Ruby or Node, or use JSON syntax for a YAML-compatible document. Quote terms with colons, hashes, or values that could parse as another type. Verify that Markdown pages and links match the same plan.
3. Write YAML first and Markdown second. Read both back to verify the topic and preserved clusters. If the Markdown write fails, regenerate it from the stored YAML and verify the result. Report which file is pending if the retry fails.
