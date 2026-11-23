# B2B Manufacturing Writing and Phrase Review

## Engineering voice

- Start with the decision a buyer, engineer, or quality reviewer must make. Follow with the operating condition, relevant parameter, acceptance criterion, and verification method. Prefer actions such as “check the drawing revision” and “request the inspection report for the production lot.”
- Distinguish a nominal value, specification limit, measured result, and design target. Keep the units, tolerance direction, grade, specimen, load, and environment needed to interpret the number. Name the method and edition where they affect acceptance. Define an uncommon abbreviation on first use.
- Cover one decision or idea per paragraph, typically in 2–4 sentences. Review English paragraphs over 80 words and use a comparable reading length in the target language. Keep linked conditions together. After several prose paragraphs, use a table for comparable parameters, a numbered list for dependent steps, or an H3 for a distinct decision. Vary the rhythm to fit the material.
- Use the brief's section-level terms and `terminology.glossary`. Keep model names, grades, technical symbols, and standard identifiers consistent. Preserve qualifiers that change engineering meaning. Use the brief's prose ranges as editorial budgets and cut repeated explanations before adding detail.

## Bilingual phrase blacklist

Scan authored headings, prose, title and description, tables, FAQs, captions, alt text, anchors, and CTAs. Include `terminology.banned_phrases[].phrase` as applicable. Match English case-insensitively with normalized spacing, apostrophes, and hyphens. Check Chinese variants in context. Preserve necessary exact document titles and attributed quotations.

The Chinese phrases and placeholder use JavaScript Unicode escapes to keep the maintained reference in English. Read the decoded strings when reviewing or writing Chinese drafts.

```js
const chinesePhrases = {
  opening: ["\u5728\u5f53\u4eca\u5feb\u8282\u594f\u7684\u65f6\u4ee3", "\u503c\u5f97\u4e00\u63d0\u7684\u662f", "\u603b\u800c\u8a00\u4e4b"],
  superiority: ["\u884c\u4e1a\u9886\u5148", "\u4e16\u754c\u4e00\u6d41", "\u5353\u8d8a\u54c1\u8d28", "\u98a0\u8986\u6027\u521b\u65b0"],
  promise: ["\u8d4b\u80fd", "\u65e0\u7f1d\u5bf9\u63a5", "\u4e00\u7ad9\u5f0f\u89e3\u51b3\u65b9\u6848", "\u6ee1\u8db3\u60a8\u7684\u6240\u6709\u9700\u6c42"],
};
const chineseFactoryPlaceholder = "[\u5f85\u5de5\u5382\u8865\u5145: \u5177\u4f53\u7f3a\u5931\u9879]";
```

| Pattern | English blacklist | Chinese list | Rewrite |
| --- | --- | --- | --- |
| Generic openings and transitions | In today's fast-paced world, It is worth noting, Delve into, In conclusion | `opening` | Lead with the operating condition or buyer decision. Drop summaries that repeat it. |
| Unsupported superiority | Industry-leading, World-class, Cutting-edge, Game-changer, Unparalleled quality | `superiority` | Give comparable, sourced results under named conditions or remove the claim. |
| Vague promises | Unlock the potential, Seamless integration, One-stop solution, Unmatched value | `promise` | Name the interface, record, deliverable, or work the supplier can verify. |

Review the structure as well as the words. Remove stock introductions, repeated H2 openers, redundant recaps, and claims padded with intensifiers. Use evidence and buyer actions to rebuild empty paragraphs. Keep parallel structure in specifications and checklists where it helps comparison.

## Claim evidence and factory placeholders

| Evidence track | What to verify and record |
| --- | --- |
| Public technical facts | Search for and inspect the standards publisher, regulator, national lab, original study, or applicable material-grade data sheet. Record the brief evidence ID, source URL, document and revision, clause or table, relevant conditions and limitations, and verification date where material. Confirm what the accessible source covers. Narrow or omit the claim if the necessary clause, condition, or result cannot be checked. SERP excerpts and competitor claims can lead to sources. |
| First-party factory claims | Verify against `profile/profile.yaml` or user-provided material. Record the evidence ID, field or document reference, model and plant, lot or sample, test method, timing, and disclosure status as applicable. Public factory copy requires approved evidence or an approved redacted reference. Keep private evidence in the working review. |

- Tie every substantive claim to evidence, including retained copy, table cells, metadata, captions, and CTA promises. Preserve source scope and degree of certainty. Verify conversions, denominators, time frames, and whether results are comparable. For factory examples, require a real record, methodology or conditions, and permission. Credit reviewers only when identity, role, and approval are confirmed.
- Never invent or extrapolate capacity, tolerances, certification numbers or scope, lead times, MOQ, or customer cases. An industry value cannot establish a factory capability. Evidence from a single lot supports that lot within its tested conditions.
- Mark missing, conflicting, or unusable factory proof at the affected passage, table cell, or editorial evidence slot. For English use `[Factory evidence needed: specific material and scope]`. For Chinese use the decoded `chineseFactoryPlaceholder`. Replace the template text with the exact document or test, product and conditions, for example `[Factory evidence needed: Model A cutout drawing revision and critical hole tolerances]`. Remove any speculative value. Carry the brief's evidence ID and next verification action in the review.
- A placeholder identifies missing evidence. The [pre-save checklist](geo-citation-and-qa.md) decides whether the buyer's central decision can stand with the claim removed or narrowed. Escalate unresolved core measurements as blockers.

## Procurement CTA

Choose one primary action for the decision stage, at the placement specified in the brief. Use a verified contact or download path. State the inputs needed and what the buyer can reasonably request.

| Buyer need | CTA example |
| --- | --- |
| Specification sheet | Request the current specification sheet for your model and operating conditions. |
| Selection confirmation | Send the required load, duty cycle, and envelope for configuration review. |
| Layout drawing | Share the available footprint and mounting constraints to request a layout drawing. |
| Quotation | Send the drawing revision, material grade, quantity, and delivery location to request a quote. |

Verify the route and any promised deliverable, response time, sample terms, price, or availability. If no route is verified, give the buyer the applicable request checklist and record the missing destination as an editorial task.
