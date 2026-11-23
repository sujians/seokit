---
description: Audit a public page on a B2B manufacturing or export site and save a prioritized SEO/GEO report
argument-hint: "<url>"
---

Follow the registered `seo-audit` skill and read its three references. The target is `${1:-not provided}`. Verify that it is a public HTTP(S) URL. Ask for a valid URL if needed.

Try `seokit_load_profile({})` first. Use generic mode if the profile is missing, invalid, or unrelated. In Pi `codemode` (`pi --tools +codemode`), run `seokit_fetch_page`, pass the final URL and HTML to `seokit_parse_seo`, pass the raw JSON-LD blocks to `seokit_validate_schema`, and pass the same HTML to `seokit_score_geo`. Record unavailable evidence and continue with the remaining checks.

Follow the scoring reference and group findings as P0 blockers, P1 high-impact changes, and P2 improvements. Write the full report in the user's language to `audits/<domain>-<date>.md` in the current project. Read it back and report the path, scope, and key findings.
