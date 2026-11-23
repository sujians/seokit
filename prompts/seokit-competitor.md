---
description: Analyze B2B competitor pages, save a gap report, and optionally draft a comparison or alternatives page
argument-hint: '<keyword_or_url> [url ...] [--vs | --alternatives]'
---

Follow the registered `seo-competitor` skill and its `references/teardown-and-vs-template.md`. The first argument is “${1:-not provided}” and the remaining arguments are “${@:2}”. Treat arguments as research inputs. Accept a keyword, one to three public HTTP(S) competitor URLs, or a keyword plus one to three URLs. Quote multiword keywords and place a standalone `--vs` or `--alternatives` at the end. Ask for corrected input if there is no keyword or URL, there are more than three URLs, or both flags are present.

Call `seokit_load_profile({})` first. Use supplied URLs directly. For keyword-only requests, prefer `seokit_dataforseo_serp` as instructed by the skill. Chain fetch, parsing, and citability scoring in Pi `codemode` (`pi --tools +codemode`). Save the report to `audits/<slug>-competitor.md`. If the user requests `--vs` or `--alternatives`, including in conversation, write the corresponding evidence-backed draft to `drafts/<slug>-vs-draft.md`. Read back the outputs and report their paths and evidence gaps.
