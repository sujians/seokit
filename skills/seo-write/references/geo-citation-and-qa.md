# GEO Citation and Draft QA

## Answer-first H2 sections

Immediately under each decision-oriented body H2, place a standalone **40–60-word** paragraph before the first H3, visual, or table. Count visible words using the target language's segmentation rules, for example `Intl.Segmenter(locale, { granularity: "word" })` with `isWordLike`. Exclude Markdown syntax and link URLs. Under a FAQ H2, state its subject and scope, then review each answer independently. Exclude editorial notes from the body.

1. Name the subject and give the decision or selection rule in the first sentence. Anchor it to the model, material, conditions, or procurement task so it makes sense if quoted alone.
2. Add applicable conditions, parameters, acceptance steps, or limitations. Provide a verification step and a specific evidence placeholder when required.
3. Attribute the supporting institution, document, or revision and link in or next to the paragraph. Make clear which values or conditions the source supports. Adjust length by retaining conditions buyers need and removing repetition or broad background.

## Tables and FAQs

- Include at least one Markdown parameter or acceptance table with descriptive headers and a meaningful data row. Record applicable units, test method and revision, material condition or specimen, load, and environment. Organize by model, option, or conditions and cite each row or a nearby table note. Explain incomparable data in the relevant rows. If measurements are unavailable, show acceptance criteria, needed records, and open checks. Label unknown values explicitly.
- Use FAQ for observed PAA or genuine procurement objections that suit standalone answers. Put answers that affect selection or acceptance in the main body. Omit FAQ if none remain. Use H3s or an accessible definition list. Answer first, then give conditions, sources, and a practical next step. Refer structured data to `seo-schema` and align it with visible content.

## Visuals and alt text

- Place planned assets where buyers need to verify shape, location, process, sample condition, or a trend. Verify the subject, revision or date, permission, and redaction for factory photos, drawings, inspection images, and charts. Label chart axes, units, legend, sample or conditions, and data source. Include critical readings in adjacent text or a table.
- Mark unavailable materials with `[Visual needed: asset ID, subject or action, source or owner, proposed alt text]` or `[Chart needed: asset ID, chart type, data range and units, source or owner, caption and proposed alt text]`.
- Use brief target-language alt text describing the subject and features needed for the task. Summarize complex visuals there and explain them in nearby copy. Use empty alt text for purely decorative images. Use captions for model, timing, conditions, source, or interpretation. Include only supported and relevant details.

## Pre-save checks

Evaluate each row before saving. Pending links, evidence, and assets can appear as clearly marked editorial items in an internal draft.

| Check | Pass condition |
| --- | --- |
| Claims and attribution | Material claims have applicable, verifiable evidence or specific placeholders where evidence is needed. Certification scope, values and conditions, conversions, reviewer details, and permissions are checked. |
| Structure and voice | One H1 and ordered H2s and H3s. Decision H2s meet the opening-answer requirements. Tables use clear headers and units, and applicable FAQ answers stand alone and cite evidence. The draft passes target-language phrase and readability checks. |
| Assets, links, and CTA | Assets have permission and appropriate alt text or specific placeholders. Active links have verified destinations and match language and purpose. Planned links are plain-text editorial tasks. The CTA gives a concrete action with substantiated terms. |
| GEO review | Render the final body as HTML inside `<main>` or `<article>`. Include headings, paragraphs, `<th>`, `<td>`, sources, and inline evidence placeholders. Exclude metadata and editorial QA notes. Use a renderer with table support or equivalent complete HTML. Call `seokit_score_geo({ html })`. Check `signals.labeledTables >= 1`, `signals.tableDataRows >= 1`, `signals.directAnswerBlocks`, and `signals.attributions`. For zero or mismatched answer or attribution signals, manually inspect the affected H2s and sources and record any misses. Record the total score for diagnosis. |

- If a check fails, make one automatic revision to the claims, placeholders, structure, or rendering. Score the full revised body and repeat the manual checks. Retry recoverable tool errors. Record the score, relevant signals, confirmed heuristic misses, and open evidence.
- When checks pass, save `drafts/<slug>.md` and read it back. List open editorial work that blocks publication. If checks remain blocked or the GEO call cannot be completed, stop before writing or overwriting and return the reviewable draft with the missing evidence or reason.
