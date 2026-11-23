---
description: Research B2B buyer intent, save a technical or procurement brief, and review and save a Markdown draft
argument-hint: "<topic_or_keyword>"
---

The topic is “${@:-not provided}”. Ask the user for a topic if it is missing. The topic can contain multiple words.

1. Call `seokit_load_profile({})` first. Use the applicable profile and materials supplied by the user. If the profile is unusable, continue in generic mode and record that limitation.
2. Follow `seo-brief` and its references. Research leading relevant pages and produce the complete brief. Apply the brief checklist, choose its shared artifact slug, then save and read back `drafts/<slug>-brief.md`.
3. Pass the saved path to `seo-write`. Follow that skill to reload the profile and brief, confirm create or update mode, verify evidence, draft section by section, and run the pre-save checklist and `seokit_score_geo` review. Keep the Schema recommendations in the brief for `seo-schema`.
4. Use the `seo-write` save gate for `drafts/<slug>.md`, with the brief's artifact slug. On success, report both paths, the page type, the final GEO score, and open publication dependencies. When a gate remains blocked, including missing factory measurement evidence essential to the buyer decision, report the brief path, the blocker and next action, and any reviewable text. Preserve the saved brief and any existing draft.
