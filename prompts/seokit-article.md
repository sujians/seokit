---
description: Research B2B buyer intent, save a technical or procurement brief, and review and save a Markdown draft
argument-hint: "<topic_or_keyword>"
---

The topic is “${@:-not provided}”. Ask the user for a topic if it is missing. The topic can contain multiple words.

1. Call `seokit_load_profile({})` first. Use the applicable profile and materials supplied by the user. If the profile is unusable, continue in generic mode and record that limitation.
2. Follow `seo-brief` and its references. Research leading relevant pages and produce the complete brief. Apply the brief checklist, choose its shared artifact slug, then save and read back `drafts/<slug>-brief.md`.
3. Pass the saved brief to `seo-write` and follow its references. Use the H2/H3 outline, terms, metadata, links, assets, and evidence handoff. Verify claims, draft the content, and complete the pre-save checks including `seokit_score_geo`. Make one automatic improvement pass and rescore if needed. Keep the Schema recommendations in the brief for the separate `seo-schema` workflow.
4. After the checks pass, write and read back `drafts/<slug>.md` in the current project, using the same artifact slug as the brief. Report both paths, page type, GEO score, and outstanding evidence. If draft checks remain blocked, report the saved brief path, reviewable content, and the blocker. Preserve any existing draft until the checks pass.
