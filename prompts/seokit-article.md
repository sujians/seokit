---
description: Research B2B buyer intent, save a technical or procurement brief, and review and save a Markdown draft
argument-hint: "<topic_or_keyword>"
---

The topic is “${@:-not provided}”. Ask the user for a topic if it is missing. The topic can contain multiple words.

1. Call `seokit_load_profile({})` first. Use the applicable profile and materials supplied by the user. If the profile is unusable, continue in generic mode and record that limitation.
2. Follow `seo-brief` and its references. Research leading relevant pages and produce the complete brief. Apply the brief checklist, choose its shared artifact slug, then save and read back `drafts/<slug>-brief.md`.
3. Pass the saved path to `seo-write`. Follow that skill to draft the core technical answer first, review claims and readability, and run the `seokit_score_geo` review. Keep the Schema recommendations in the brief for `seo-schema`.
4. Save `drafts/<slug>.md` with the brief's slug, using factory placeholders for optional missing records. Apply the draft save conditions in `seo-write`. Report both paths, the page type, the GEO result when available, and open publication items. If saving is blocked, report the brief path, the specific issue, and the next action. Preserve the saved brief and any existing draft.
