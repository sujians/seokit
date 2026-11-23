# GEO Citation and Draft QA

## Direct technical answers

Lead core H2s with a sentence or short paragraph that answers the section's question. Name the concept, model, process, or rule and include the conditions that change the answer. Follow with the explanation, calculation, worked example, or exception the reader needs. Group closely related sourced claims under a short attribution. Name the document and edition near the claim when they affect the interpretation.

On informational pages, check that core technical content accounts for at least 80% and conversion content for at most 20%, preferably 10–15% for conversion. Include DFM handoff, procurement submission checklists, service descriptions, and inquiry CTAs in the conversion share.

## Tables, FAQ, and visuals

- Use meaningful tables for comparisons, defects and likely causes, or acceptance criteria. Include clear headers and supply units, conditions, tests, and sources where they affect interpretation. Public methods can support a generic checklist or defect table. Label illustrative inputs and use specific placeholders for unavailable factory values.
- Default to a short standalone FAQ when questions recur or readers commonly confuse concepts or versions. Lead each answer with a direct response in roughly 40–60 words, with the decisive condition or exception. Place the standalone FAQ after the technical sections and concise DFM or procurement handoff, immediately before the closing CTA when present. Keep answers that change selection or acceptance in the main flow as well. Distinguish observed PAA from inferred questions in the brief.
- Use relevant drawings, photos, and charts with clear captions, useful alt text, and any required permissions. Label illustrations. For charts, give units and conditions and provide a text or table equivalent. For a missing visual, leave a short editorial marker describing the asset and its intended use.

## Draft review checklist

- **Coverage and structure.** Check that the draft resolves the core search task at the depth it needs. Review the brief's outline, key questions, and planned examples by heading. In an update, check the retained material and preserve the verified publication URL unless a move is approved.
- **Claims and sources.** Explain established industry methods with clear examples and applicable limits. Verify specific public facts such as an exact standard requirement, value, or edition through an authoritative source. Use profile or user evidence for factory claims and keep private records in working notes. Keep attribution clear and specific to the claims it supports.
- **Link formatting.** Before saving, check paragraphs and list items for standalone Markdown source links after closing punctuation. During automatic revision, move those links into the sentence using descriptive anchor text or into the final `## Sources` section (localized for the draft language). Check the [link and source formatting rules](b2b-writing-and-anti-slop.md#link-and-source-formatting-rules) for the two-link limit per subsection and the placement of the sources list.
- **Page details.** Check the single H1, heading hierarchy, terms, tables, FAQ, accessibility, and any applicable banned phrases. Add `title`, `description`, and `lang` to Markdown YAML front matter and identify the publication path in an editorial note. Check links and the CTA route. Record pending destinations as editorial items. Keep Schema.org generation and validation with `seo-schema`.

### Draft save and publication dependencies

- Save a complete working draft when optional factory measurements, firsthand examples, customer work orders, or visuals are missing. Omit the unsupported assertion, leave a short factory placeholder where useful, and report the item for follow-up. Continue with supported explanations, illustrative examples, or buyer-side checks. A verified standard requirement can be explained separately from a missing claim about the factory.
- Pause saving only when one of these issues still prevents a trustworthy draft after revision:
  - Core product positioning is missing, so the page cannot establish what product or application it covers.
  - The article requires a hard compliance commitment that cannot be verified, and removing it would change the requested page's core purpose.
  - Serious fabricated data remains, such as invented measurements, certificate numbers, or customer results. Remove and replace it with supported material if possible.
- If saving is paused, identify the affected passage and the information needed, preserve the brief and any existing draft, and share reviewable text when available. Treat outstanding formatting, asset, source follow-up, and GEO issues as editorial items after making any immediate fixes.

### GEO review and revision

1. Render the complete intended Markdown body to HTML inside `<main>` or `<article>`, preserving headings, paragraphs, links, lists, table headers and rows, and available visuals. Exclude metadata, private records, and editorial placeholders. Call `seokit_score_geo({ html })`.
2. Use `score`, `breakdown`, `signals`, and `excerpts` to review the actual copy. Check `directAnswerBlocks` for quotable passages, `labeledTables` and `tableDataRows` for planned tables, and `attributions` for source wording. Use editorial judgment where the heuristic misses a valid passage or citation.
3. Make one automatic revision when the draft needs clearer answers, better tables, stronger attribution, or link formatting fixes. Recheck the affected paragraphs and list items, then rescore the complete revised body. Retry a recoverable tool error. Record unresolved tool or heuristic limits with the draft and apply the save conditions above. Write and read back `drafts/<slug>.md` when it can be saved. Report the available GEO result and open publication items.
