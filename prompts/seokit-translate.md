---
description: Adapt a Markdown draft to a target market's procurement search habits, preserving specifications and certification evidence and adding hreflang guidance
argument-hint: "<file_path> <target_locale>"
---

The source file is “${1:-not provided}”, the target locale is “${2:-not provided}”, and the remaining arguments are “${@:3}”. Quote paths containing spaces. Ask for corrected input if an argument is missing, there are extra arguments, or the locale is invalid. Use a standard BCP 47 language tag, such as `de-DE` or `en-US`.

1. Load `seo-localize` and its two references. Read the source Markdown and call `seokit_load_profile({})`. Rewrite for the target market's procurement searches and confirmed terminology. Check each specification, condition, and certification against the source.
2. Save to `drafts/<slug>.<locale>.md` in the current project. Use the source basename without `.md` for the slug. Replace an existing, identifiable locale suffix. Normalize BCP 47 casing and exclude path separators and traversal components such as `..` from the locale. Check both paths and preserve the source file. Update an existing localized draft only when the user requests it.
3. Append hreflang guidance and localization QA results. Mark publication URLs and fallback policies as pending when unconfirmed. Read back the output and report the path and any open specification, compliance, or publication items.
