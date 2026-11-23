---
description: Evaluate AI crawler policy and page citability for a B2B manufacturer, and generate a GEO report and llms.txt draft
argument-hint: "[url]"
---

Follow the registered `seo-geo` skill and read `references/llms-txt-and-entities.md`. The target is `${1:-not provided}`. First try `seokit_load_profile({})` to read `profile/profile.yaml`. If the URL was omitted, use `project.website` from the applicable profile. Ask for a public HTTP(S) URL if no valid target is available.

Follow the reference workflow to fetch the page, call `seokit_check_robots` for the final URL, and pass the fetched HTML to `seokit_score_geo`. Use Pi `codemode` for the full chain (`pi --tools +codemode`). Record unverifiable checks and complete the ones that remain available.

Write on-site improvements, external entity checks, and retest criteria to `audits/<slug>-geo.md`. Use the applicable profile and verified public pages to prepare `drafts/llms.txt`. Read back the outputs and report paths, priority changes, and evidence still needed.
