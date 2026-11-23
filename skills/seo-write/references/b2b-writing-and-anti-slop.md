# B2B Manufacturing Writing and Phrase Review

## Engineering voice

- Start with the problem the reader came to solve. When explaining a technical concept, give the definition, rule, and worked example before the manufacturing handoff. When qualifying a product or supplier, give the fit criteria, operating conditions, and verification method.
- Distinguish a nominal value, specification limit, measured result, and design target. Keep the units, tolerance direction, grade, specimen, load, and environment needed to interpret the number. Name the method and edition where they affect acceptance. Define an uncommon abbreviation on first use.
- Cover one decision or idea per paragraph, typically in 2–4 sentences. Review English paragraphs over 80 words and use a comparable reading length in the target language. Keep linked conditions together. After several prose paragraphs, use a table for comparable parameters, a numbered list for dependent steps, or an H3 for a distinct decision. Vary the rhythm to fit the material.
- Use the brief's section-level terms and `terminology.glossary`. Keep model names, grades, technical symbols, and standard identifiers consistent. Preserve qualifiers that change engineering meaning. Use the brief's prose ranges as working estimates. Expand a section when the reader needs the rule, example, or exception to apply the answer.

## English phrase blacklist

Scan authored headings, prose, title and description, tables, FAQs, captions, alt text, anchors, and CTAs. Include `terminology.banned_phrases[].phrase` as applicable. Match phrases case-insensitively with normalized spacing, apostrophes, and hyphens. Preserve necessary exact document titles and attributed quotations.

| Pattern | Phrases to avoid | Rewrite |
| --- | --- | --- |
| Generic openings and transitions | In today's fast-paced world, It is worth noting, Delve into, In conclusion | Lead with the operating condition or buyer decision. Drop summaries that repeat it. |
| Unsupported superiority | Industry-leading, World-class, Cutting-edge, Game-changer, Unparalleled quality | Give comparable, sourced results under named conditions or remove the claim. |
| Vague promises | Unlock the potential, Seamless integration, One-stop solution, Unmatched value | Name the interface, record, deliverable, or work the supplier can verify. |

Review the structure as well as the words. Remove stock introductions, repeated H2 openers, redundant recaps, and claims padded with intensifiers. Use evidence and buyer actions to rebuild empty paragraphs. Keep parallel structure in specifications and checklists where it helps comparison.

## Claim evidence and factory placeholders

| Claim type | How to write it |
| --- | --- |
| Established industry knowledge | Explain public methods such as naming syntax, common density-grade suffix mappings, formula concepts, zero-degree rotation conventions, and familiar weld-defect causes where relevant. Give original worked examples with clear assumptions. A paywalled standard can still have public explanations of its underlying concepts. Use a short edition and product data sheet note when rules vary. Avoid copying complete protected standards tables. |
| Specific public technical facts | Check edition-specific requirements, exact numerical limits, material properties, formal test conditions, and regulatory obligations through the standards publisher, regulator, national lab, original study, or applicable data sheet. Attribute the facts near their use and follow the link rules below. If the exact requirement is unavailable, keep the useful public explanation and flag the specific value or clause to verify. |
| Factory-specific claims | Verify yield, tolerance capability, capacity, lead times, MOQ, certificate numbers and scope, and real customer cases against `profile/profile.yaml` or user-provided material. Preserve the covered model, plant, sample, date, method, and disclosure limits where they affect interpretation. Keep private records in the working notes. |

- Use a generic defect comparison, inspection checklist, or worked calculation when it answers the reader's question. Label example assumptions and figures as illustrative. Require a real, publishable record for an actual factory result or customer case. Verify units and conversions and keep source conditions with the values they qualify.
- Use `[Factory evidence needed: specific material and scope]` where factory proof is missing. Localize the short marker to the draft language when needed. Replace speculative data with the specific request, such as `[Factory evidence needed: Model A cutout drawing and hole tolerances]`. Keep writing around optional measurements and customer records. See the [draft save conditions](geo-citation-and-qa.md#draft-save-and-publication-dependencies) for unresolved issues that affect the whole draft.

## Link and source formatting rules

- Never append a standalone Markdown source link or a string of source links after the closing punctuation of a paragraph or list item. This also applies to a link on its own line directly beneath the prose.
- Use descriptive anchor text as part of the sentence whenever you link to a standard, data sheet, application note, or related site page in the body. For example, write `Check [the publisher's revision table](https://example.com/standards/revisions) before specifying an edition.` or `See [our assembly acceptance guide](/guides/assembly-acceptance) for inspection examples.`
- Keep only links that help the reader verify a claim or take the next step. Use at most two links per subsection across internal and external links combined. Name the relevant source and edition in plain text where readers need that context.
- Collect the remaining verified, relevant references in a final `## Sources` section after the closing CTA, when present. List each source once with a descriptive title and its link. Localize the heading to the draft language. For Chinese drafts, decode the JSON string `"## \u53c2\u8003\u8d44\u6599"` for the heading.

## Content balance and procurement CTA

On informational pages such as standards references, process principles, and selection explainers, devote at least 80% to core technical content. Keep conversion content at or below 20%, preferably 10–15%, including DFM handoff, procurement submission checklists, service descriptions, and inquiry CTAs. Count technical FAQ answers toward technical content and place the standalone FAQ after the technical sections and concise handoff, immediately before the closing CTA when present.

In procurement guides, product pages, and selection comparisons, give most of the space to objective specifications, qualification criteria, and selection logic. Keep supplier workflows and service descriptions concise and relevant to the reader's next decision.

Choose one primary action for the decision stage, at the placement specified in the brief. Use a verified contact or download path. State the inputs needed and what the buyer can reasonably request.

| Buyer need | CTA example |
| --- | --- |
| Specification sheet | Request the current specification sheet for your model and operating conditions. |
| Selection confirmation | Send the required load, duty cycle, and envelope for configuration review. |
| Layout drawing | Share the available footprint and mounting constraints to request a layout drawing. |
| Quotation | Send the drawing revision, material grade, quantity, and delivery location to request a quote. |

Verify the route and any promised deliverable, response time, sample terms, price, or availability. If no route is verified, give the buyer the applicable request checklist and record the missing destination as an editorial task.
