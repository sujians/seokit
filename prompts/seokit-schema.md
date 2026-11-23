---
description: Generate and validate Schema.org JSON-LD for a public B2B manufacturing page or a local draft
argument-hint: "<url_or_draft> [draft_publish_url]"
---

Follow the registered `seo-schema` skill and read `references/b2b-schema-templates.md`. The target is “${1:-not provided}”, the draft publication URL is “${2:-not provided}”, and the remaining arguments are “${@:3}”. Quote paths containing spaces. Explain the accepted arguments and request corrected input if the target is missing, there are extra arguments, or a separate publication URL was supplied for a public page.

Call `seokit_load_profile({})` first to read `profile/profile.yaml`. For a public page, chain `seokit_fetch_page` and `seokit_parse_seo` in Pi `codemode` (`pi --tools +codemode`). Read local Markdown or HTML drafts directly. Choose templates using verified page content and the applicable profile. Omit pricing and `offers` for inquiry-only equipment.

Call `seokit_validate_schema` on the final JSON. Save to `drafts/<slug>-schema.jsonld` only after it meets the skill's validation gate. If the user requests inline delivery, use a copyable JSON block in a report under `audits/`. Read back the output and report its path, types, and outstanding evidence.
