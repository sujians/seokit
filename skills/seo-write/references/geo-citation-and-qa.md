# GEO Citation and Draft QA

## Answer-first sections

Place a standalone **40–60-word opening paragraph** immediately under every core decision H2, before any H3, table, or visual. Count visible words with target-language segmentation such as `Intl.Segmenter(locale, { granularity: "word" })` and `isWordLike`. Include the visible anchor text and exclude link URLs and Markdown syntax. Size the rest of the section to the brief's budget and buyer task.

1. Name the product, process, or decision in the first sentence and give the actionable answer. Use a subject and wording that retain their meaning outside the page.
2. Give the decisive parameter, operating condition, acceptance step, or limitation. Include the conditions readers need to apply the answer and preserve the claim's certainty.
3. Attribute material claims to the applicable document or institution in or immediately after the block. Keep a source near the value or rule it actually supports. A verification step can give a useful answer when the brief calls for buyer-side confirmation.

## Tables and buyer questions

- Include at least one meaningful parameter comparison or acceptance-criteria table with explicit headers and data rows. Compare like-for-like models or options. Include parameter, value or acceptance rule, units, test method, conditions, and source in the relevant cells or adjacent notes. Mark unknown or incomparable cells and explain the reason. When measured values are unavailable, list the acceptance conditions, records to request, or verification steps. Keep unsupported values out of the table.
- Resolve accepted objection IDs in the assigned section, table, checklist, or FAQ. Put criteria that change selection or acceptance in the main decision flow. If the brief calls for an FAQ, use H3 questions or an accessible definition list and lead each answer with a standalone response, then add conditions, supporting evidence, or a next action. Check whether a purported PAA question was observed and keep inferred questions identified in the working review. Keep Schema.org recommendations with the brief.

## Visuals and alt text

- Place drawings, inspection images, shop-floor photos, and charts at the brief's assigned sections. Match the model, revision or date, conditions, source owner, permission, and redaction needs. Identify illustrations as such. A chart needs labeled axes, units, series, data provenance, and a nearby text or table equivalent. A proposed selector or calculator needs the documented inputs, valid ranges, outputs, assumptions, and a usable static equivalent.
- For unavailable assets, use `[Visual needed: asset ID, actual subject or action, revision or condition, owner, proposed alt text]` or `[Chart needed: asset ID, measures and units, conditions, owner, caption, proposed alt text]`. For an actual factory photo, name what must be photographed and the detail the buyer must see. Leave the slot as an editorial marker until the material exists and disclosure is cleared.
- For available assets, write concise target-language alt text describing the feature the buyer needs. Use empty alt text for decorative images. Keep detailed interpretation, dimensions, or data in the caption or nearby text. Avoid repeated caption text and keyword stuffing.

## Pre-save checklist

Use the saved brief as the drafting contract. In the working review, match each brief ID to its draft section or a documented open item. For a scope change, record the reason and verify that the original buyer task still has a supported answer. Keep evidence notes and private provenance in the working review. Put the final `title`, `description`, and `lang` in Markdown YAML front matter. Record the confirmed or proposed publication path in a separate editorial note within the draft.

| Brief section | Pass condition |
| --- | --- |
| 1. Page Task and Search Intent | Mode, market, language, buyer, decision, and next action match. The artifact slug matches the brief. The verified update URL stays in use unless a move is approved. |
| 2. SERP and Competitor Structure | Use the brief's observed format, coverage limits, and depth basis. In updates, check retained copy against the current-page inventory and verified source copy. Account for every retain, strengthen, and add instruction. |
| 3. Gaps and Information Gain | Each priority gap maps to its promised decision aid and verified support. Check the stated scope against the inspected sample. Use a brief-supported alternative only when it still resolves the buyer decision. |
| 4. Search Terms and Technical Entities | Check every assigned term ID in its intended H2/H3 and placement, including relevant parameters, units, and standards. Use the preferred locale term or a verified equivalent. Record omissions or changes where the term would imply an unsupported capability or certification. |
| 5. PAA and Procurement Objections | Verify that each accepted question ID has a useful answer in its planned placement and carries the applicable conditions and evidence. Check any dedicated FAQ for standalone answers. |
| 6. Tables, Visuals, and Interactive Assets | Match required asset IDs, placement, labels, units, conditions, permissions, captions, and alt text. Use specific placeholders for missing assets the decision can proceed without. Check any required static fallback. |
| 7. H1, Title, Meta Description, and Page Path | Check one H1, the opening answer, scoped title and description, applicable display guidance, and verified or proposed path. Check metadata for unsupported claims. |
| 8. Internal Links | Check the planned outgoing anchor's wording, section, actual target, redirect destination, market, and language against the brief. Use descriptive target-language anchor text. Reject duplicate or self-links and placeholders presented as active URLs. Record incoming placements and pending targets as editorial actions. |
| 9. H2/H3 Outline for seo-write | Check order, hierarchy, mode actions, opening answers, and the assigned ID coverage. Compare section and total prose against the brief's depth rationale. Check the planned CTA placement and the inputs and route it names. |
| 10. Evidence Handoff for seo-write | Recheck the exact source for every material fact, including numbers, standards, table cells, first-party claims, and CTA promises. Confirm disclosure, review approvals, and scope. Use specific placeholders for open factory items and apply the blocker rule below. |
| 11. Schema Handoff for seo-schema | Check that recommended entities still have a matching visible section or navigation and supporting evidence. Report changed or unmet prerequisites with the handoff. Leave markup generation and validation to `seo-schema`. |
| Voice and accessibility | Apply the bilingual and profile phrase checks across all authored page fields. Check paragraph rhythm, alt text, and scannability. Preserve meaningful qualifications and delete generic padding. |

### Draft blockers and publication dependencies

- **Block the draft** if the main selection, acceptance, or capability answer still depends on unavailable factory test or measurement evidence, or if another required pre-save check fails. A placeholder, a high GEO score, or a generic industry value cannot clear this gate. Name the affected section and evidence IDs, the buyer decision, the required document or test and conditions, and the next action. Keep `drafts/<slug>-brief.md` and any existing draft intact. Return reviewable text in the response when available.
- **Allow a marked internal draft** when the primary decision is fully supported and an outstanding item affects only publication or an ancillary claim. Remove or narrow the unsupported claim, leave the specific editorial marker where needed, and report the dependency. If the brief already allows a sourced alternative decision aid, check it against the same buyer task before clearing a blocker.

### GEO review and revision

1. Render the complete intended Markdown body to HTML inside `<main>` or `<article>`, preserving headings, paragraphs, links, lists, real table headers and rows, and available visual descriptions. Exclude metadata, private evidence, and editorial notes and placeholders from the scored copy. Call `seokit_score_geo({ html })` on that rendering.
2. Check the returned `score`, `breakdown`, `signals`, and `excerpts`. Require `signals.labeledTables >= 1` and `signals.tableDataRows >= 1` for the planned parameter or acceptance table. Use `signals.directAnswerBlocks` and the excerpts to inspect answer coverage and `signals.attributions` to review source wording. Manually check every opening block and attribution against the brief. Document heuristic misses where verified prose or a real citation falls outside the tool's patterns. Use the score for diagnosis without a fixed numeric cutoff.
3. For a fixable failure, make one automatic revision in the working copy and repeat the checklist and score the complete revised body. Retry a recoverable tool error. If a gate still fails or the score cannot be obtained, report the reason before saving. After a pass, write and read back `drafts/<slug>.md`. Report the final score, material dependencies, and any documented heuristic misses.
