---
name: seo-schema
description: Generate and validate Schema.org JSON-LD for public B2B manufacturing pages and local drafts. Use for Organization, inquiry-only Product, FAQ, HowTo, and breadcrumb markup.
---

# B2B Structured Data

Read the [B2B templates, evidence rules, and workflow](references/b2b-schema-templates.md).

1. Call `seokit_load_profile({})` to read `profile/profile.yaml`. Check that it applies to the organization, factory, model, and market. If the profile is unavailable or inapplicable, use verifiable page facts and applicable evidence supplied by the user. Omit unverified company claims.
2. Fetch a public URL with `seokit_fetch_page` and pass the final URL and original HTML to `seokit_parse_seo` in Pi `codemode`. Check primary entities, specifications, FAQs, and navigation against the visible body. Use existing JSON-LD to identify types, IDs, and conflicts. Validate it separately and record existing issues. Read local Markdown or HTML directly and use only confirmed publication URLs. If the fetch fails and no draft is available, identify the missing input.
3. Choose applicable types from `Organization`, `Product` with `Product.manufacturer`, `FAQPage`, `HowTo`, and `BreadcrumbList`. Link multiple entities with `@graph` and stable `@id` values. Match each claim to visible content and the applicable factory, certificate, model, conditions, and price. Omit `offers` for inquiry-only equipment. List missing evidence at delivery. Use `HowTo` for genuine actionable steps when explicitly requested or a known Schema.org consumer needs it, and set `allowHowTo: true` when validating.
4. Pass the final serialized JSON string to `seokit_validate_schema({ blocks: [json] })` with the HowTo option when applicable. Require `valid: true`, `blocksChecked: 1`, and `nodesChecked > 0`. Fix errors and warnings that can be resolved with evidence, then revalidate. Record remaining warnings and omitted fields. If validation remains blocked, deliver diagnostics and actions.
5. Save the validated JSON to `drafts/<slug>-schema.jsonld` and read it back. If inline delivery is requested, place the same JSON in a fenced `json` block in a report under `audits/`. Report the path, types, recommendations for merging or replacing existing markup, and evidence needs.
