# B2B Manufacturing Writing and Cliché Review

## Engineering voice and readability

- Open with the decision facing purchasing, engineering, or quality. Use concrete nouns and actions such as “check the drawing revision” or “retest with the specified method.” Identify the subject, requirement, conditions, acceptance method, and exceptions. Use market terminology and `terminology.glossary`.
- Address one question per paragraph, typically in 2–4 sentences. Review English paragraphs over 80 words and use a comparable reading length for the target language. Keep a standard clause, direct quote, or acceptance condition together when readers need the full context. Apply the separate opening-answer length to decision H2s.
- After three consecutive paragraphs in an H2, consider an H3, table, or list if it helps readers complete a task. Use tables for comparisons, numbered lists for ordered actions, and bullets for parallel items. Vary paragraph length and use bold for critical quantities, units, or criteria.
- Distinguish nominal values, measurements, acceptance limits, and design targets. Preserve ranges, units, material condition, and tolerance symbols. Define uncommon abbreviations on first use and keep units, standard IDs, grades, and models consistent.

## Phrases to avoid

Review original headings, copy, metadata, tables, FAQs, captions, alt text, anchors, and CTAs against this table and applicable `terminology.banned_phrases[].phrase` entries. In English, ignore case and normalize whitespace, apostrophes, and hyphens. Check target-language equivalents and typographic variants. Preserve exact document titles, proper names, and necessary attributed quotes in context.

| Pattern | Examples | Edit |
| --- | --- | --- |
| Generic openings and transitions | In today's fast-paced world, In an ever-evolving landscape, It's important to note, Dive into, Delve into, In conclusion | Start with a procurement decision, condition, or action. |
| Unsupported superiority | Game-changer, Cutting-edge solution, State-of-the-art technology, Unparalleled quality, World-class manufacturer, Industry-leading quality | Give comparable measurements, conditions, and sources when supported. |
| Vague promises | Unlock the potential, Harness the power, Seamless integration, One-stop solution, Unmatched value | Specify scope, interfaces, records, responsibilities, or conditions. |

Review the structure for redundant previews, formulaic openings and summaries, repeated claims, unsupported comparisons, and stacked qualifiers. Organize repeated sentence patterns around an action or evidence. Keep technical terms and qualifications where precision requires them.

## Evidence and placeholders

| Claim | Verification and record |
| --- | --- |
| Public technical facts such as standards, material properties, tests, and regulation | Search and consult publishers, regulators, national labs, original peer-reviewed research, or data sheets for the relevant material grade. Record authoritative links, titles, jurisdictions, revisions, sections, and dates as applicable. A catalog supports visible version and scope. If a clause is unavailable, narrow or omit the claim or use `[Verification needed: standard revision, clause, and claim]`. Media and competitors can provide leads to original sources. |
| Factory facts such as site, model, material, tolerance, equipment, capacity, certification, MOQ, samples, and lead time | Use verified `profile/profile.yaml` fields or user materials. Record the field path or document name, revision, page, or table. Check model, plant, quantity, conditions, timing, certificate scope, and status. Cite approved public evidence or use approved redacted excerpts. |

- Match evidence to every claim, including table cells, captions, metadata, and CTA promises. Identify measured facts and recommendations. Give sample, conditions, and limits for factory examples. Verify reviewer identities and obtain consent before crediting them. Use dates reflecting actual verification or substantive updates.
- When necessary factory evidence is missing, conflicting, unclear in scope, or unavailable for publication, use `[Factory evidence needed: specific material and scope]` at the applicable passage, table cell, or evidence slot. Specify the material, subject, and conditions, for example `[Factory evidence needed: Model A cutout drawing revision and critical hole tolerances]`. Convert relevant TODOs from the brief and remove speculative values. Generic drafts can give sourced acceptance advice while retaining required evidence placeholders.
- Check conversions, percentage denominators, and time frames. Keep single-lot evidence scoped to that lot. Verify factory claims independently of typical industry and competitor values.

## Procurement CTA

Give one main action after the buyer has enough information to decide. For engineering review, request the latest drawing, grade, critical inspection items, and lot size. For a comparison, suggest requesting a test report covering the relevant model. A procurement guide can include RFQ or acceptance fields. State what to submit or verify, use verified contacts and documents, and substantiate turnaround, sample, price, and expedite terms. If a contact path is unverified, give a buyer action that can be completed independently.
