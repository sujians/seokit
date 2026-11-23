---
name: seo-write
description: Write and review evidence-backed B2B technical and procurement content. Use for article drafts, product pages, process capability pages, selection comparisons, and buyer guides that need source verification and a GEO self-check.
---

# B2B Technical and Procurement Writing

1. **Scope the task.** Use the complete `seo-brief` handoff. If invoked without a brief, define the page type, buyer task, H2 outline, and evidence needs first. Reuse a verified profile or call `seokit_load_profile({})`. If unavailable, use user-provided materials and verified public sources. Match any missing page planning details against `clusters/*-clusters.yaml` for keywords, type, URL, and links.
2. **Verify evidence.** Load [B2B manufacturing writing and cliché review](references/b2b-writing-and-anti-slop.md) before research and drafting. Search for authoritative primary sources for public technical facts. Verify factory claims and disclosure scope against `profile/profile.yaml` or user materials. Record evidence, subject, revision, and conditions for each claim. Replace unsupported company claims with `[Factory evidence needed: specific material and scope]`.
3. **Draft.** Write conclusions, comparison criteria, and acceptance steps in buyer decision order. Load [GEO citation and draft QA](references/geo-citation-and-qa.md) for body structure and assets. Apply 40–60-word answer-first paragraphs under decision-oriented H2s, parameter tables, relevant FAQs, visuals, and alt text. Use target-market terms, apply the project and editorial phrase lists, and provide an actionable procurement CTA.
4. **Review and save.** Follow the GEO reference and call `seokit_score_geo` on the complete HTML body corresponding to the proposed final draft. Make one automatic improvement pass and retest if needed. After the evidence, structure, voice, asset, link, and GEO checks pass, write `drafts/<slug>.md` as directed by the caller and read it back. Report the actual score and open items. If a check remains blocked or scoring cannot be completed, return reviewable content and the reasons, and pause writing or overwriting.
