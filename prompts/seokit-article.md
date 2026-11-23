---
description: Research B2B buyer intent, build a technical or procurement brief, and review and save a Markdown draft
argument-hint: "<topic_or_keyword>"
---

The topic is “${@:-not provided}”. Ask the user for a topic if it is missing. The topic can contain multiple words.

1. Call `seokit_load_profile({})` first. Use the applicable profile and materials supplied by the user. If the profile is unusable, continue in generic mode and record that limitation.
2. Load `seo-brief` and its references. Fetch and parse leading relevant pages in the target market. Produce all nine brief sections and hand the full brief to the writing workflow.
3. Load `seo-write` and its references. Verify claims, draft the content, and complete the pre-save checks including `seokit_score_geo`. Make one automatic improvement pass and rescore if needed.
4. After the checks pass, write the complete draft to `drafts/<slug>.md` in the current project. Use lowercase ASCII letters, digits, and single hyphens in the slug, based on the topic and any necessary page type or market qualifier. Use a readable romanization for topics without an ASCII form. Check for existing drafts. Update a matching draft if the user requested a revision. Otherwise use an available numeric suffix. Keep the filename and metadata slug consistent.
5. Read back the saved draft. Report the path, page type, full brief, GEO score, and outstanding evidence. If a check remains blocked, pause writing or overwriting and return the full brief, reviewable content, and the reason.
