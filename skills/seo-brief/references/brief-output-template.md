# B2B Brief Output Template

Use these sections in order. Replace example labels with target-language content and cite the actual sources. Give queries, pages, gaps, terms, questions, assets, evidence, and outline sections short IDs. Reference those IDs across tables. Keep unknowns explicit and record a verification action for each material open item.

## Content Brief — [primary query]

### 1. Page Task and Search Intent

- Primary query, buyer role and knowledge level, market, language, buyer stage, decision, and next action.
- Search intent, B2B intent category, dominant result formats, confidence, and reasons for choosing the page type.
- Create or update mode, current page or proposed site path, cluster and page ID, hub or spoke role, and applicable profile or generic-mode limits.
- Research scope with query ID, query, provider or search location, language, device, date, and any observed SERP feature. Note optional keyword metrics and their scope.

### 2. SERP and Competitor Structure

| Page ID, query and organic rank | Final URL, role and format | Main H2s in order and relevant H3s | Estimated main prose and basis | Technical depth, evidence, assets and CTA | Coverage or failure |
| --- | --- | --- | --- | --- | --- |

Record eligible, attempted, fully inspected, partly inspected, and unavailable counts. List skipped or supplemental pages with the reason. Include the current-page inventory in update mode and record what to retain, strengthen, and add. State the comparable competitor length range, median and sample size, or why they are unknown.

### 3. Gaps and Information Gain

| Gap ID and buyer decision | Observed page IDs and locations | Gap dimension and coverage | Impact, competitive advantage and evidence effort | Priority and planned section |
| --- | --- | --- | --- | --- |

State the specific new decision aid or insight, what the inspected pages provide, what the proposed page adds, and the evidence that will support it. Reference its gap, assets, and outline sections. Give a sourced alternative or a clear dependency when the preferred gain needs unavailable factory proof.

### 4. Search Terms and Technical Entities

| Term ID and role | Preferred target-language term, synonym or abbreviation | Buyer relevance and source | Outline section and placement | Verification or scope note |
| --- | --- | --- | --- | --- |

Cover the primary query, relevant secondary queries, and needed technical terms. Include entities such as products, processes, materials, standards, parameter names, units, and application conditions as applicable. Flag terms that imply an unverified capability or certification. Use the profile glossary where applicable.

### 5. PAA and Procurement Objections

| Question ID and wording | Observed PAA, buyer record, public source, or inference | Buyer role, decision and conditions | Answer direction, evidence IDs and placement |
| --- | --- | --- | --- |

Cite dates and query scope for observed PAA. Consider applicable objections about operating conditions, throughput, voltage, tolerances, certification, substitutions, MOQ, lead time, warranty, and after-sales support. Mark unverified terms or offers. Assign questions to the decision section, table, checklist, or FAQ that will answer them.

### 6. Tables, Visuals, and Interactive Assets

| Asset ID, type and section | Decision it supports | Rows or inputs, outputs, units and valid conditions | Source, owner, permissions and status | Caption, alt text or accessible fallback notes |
| --- | --- | --- | --- | --- |

Plan at least one meaningful parameter table with headers and data rows. Use a conditions or acceptance-criteria table when comparable measurements are unavailable. Add relevant dimensioned drawings, installation diagrams, inspection images, charts, or RFQ worksheets. For a useful selector or calculator, specify inputs, assumptions, valid ranges, source, outputs, and a static equivalent. Flag approval, redaction, and development needs. Mark other assets optional when the table and text cover the task.

### 7. H1, Title, Meta Description, and Page Path

- **H1 and opening:** Use one H1. Put the primary concept near the front and give the buyer a direct answer or qualification early.
- **Title tag:** Propose a distinct target-language title with the primary concept and a supported differentiator or buyer decision. Add the brand where it helps. For English, use roughly 50–60 characters as an editorial target. Check readability and display for the locale.
- **Meta description:** Summarize the decision, substantive content, and next step. For English, use roughly 130–160 characters as an editorial target. Record the proposed title and description lengths. Keep unverified commercial or compliance claims out of both fields.
- **Publication path:** Preserve the verified URL on updates unless a move is approved. For a new page, follow the site's verified path convention and use a short descriptive hyphenated slug with the main concept where feasible. Mark unconfirmed paths as proposed. Record the separate local artifact slug in the handoff.

### 8. Internal Links

| From and to page ID or URL | Direction and cluster link type | Target-language anchor and section | Destination status and dependency |
| --- | --- | --- | --- |

Validate `links[].from` and `links[].to` against `pages[].id` in the matched cluster. A hub should cover and link to its relevant verified children for the buyer task. A spoke should link back to its hub and to useful adjacent specifications, capabilities, or procurement steps. Record incoming placements where actionable. Check the final URLs of existing destinations against their scope. Mark planned targets pending, and avoid duplicated links, self-links, and cross-market or language mismatches. If the plan is unavailable, use verified site navigation or sitemap destinations and list planning gaps.

### 9. H2/H3 Outline for seo-write

Record the proposed total prose range, language and counting unit, competitor baseline or buyer-task estimate, and required table, FAQ, or other asset depth. List the H2s in reader decision order with their H3s immediately below. Give each H2 a working prose range and use H3 allocations as subdivisions when they are useful. Exclude tables and other nonprose assets from the prose budget.

| Section ID, heading and level | Update action | Buyer question, proposed opening answer and limits | Approximate prose budget and format | Term, gap, objection, asset and evidence IDs | Anchor, CTA or next action |
| --- | --- | --- | --- | --- | --- |

Specify the answer and verification needed for decision-oriented H2s. Assign verified terms and source requirements to their sections. Identify where tables, concise answers, FAQ, or acceptance steps belong. Preserve the buyer flow when inserting new material into an existing page.

### 10. Evidence Handoff for seo-write

| Evidence ID and outline section | Claim or decision it supports | Track and source or requested material | Scope, revision or date and disclosure | Status and verification action |
| --- | --- | --- | --- | --- |

- **Public technical facts:** Identify what needs authoritative verification, such as a standard's edition, a material property under stated conditions, or the applicable test procedure. Identify the source or the publication to obtain.
- **First-party factory claims:** Plan 2–3 specific proof items. Cite verified profile fields or user material and the covered product, plant, lot, method, and publication permission where relevant. Use `[Factory evidence needed: specific material and scope]` for missing proof. Keep private material out of public copy.
- **Review and blockers:** List confirmed reviewer roles or credentials when available, approval or recheck dates, asset and link dependencies, and what blocks a claim or publication. Use the outline, terminology, metadata, links, assets, and evidence tables as the drafting contract. Apply draft QA in `seo-write`.

### 11. Schema Handoff for seo-schema

| Recommended Schema.org type | Entity and planned visible section or navigation | Supporting evidence | Prerequisite or reason to omit |
| --- | --- | --- | --- |

Recommend only types relevant to the planned page and supported by the [page type guidance](page-type-templates.md). List the actual model, organization, or breadcrumb path where applicable. Flag existing entity IDs or conflicting markup when observed. Leave generation, visible-content checks, and validation to `seo-schema`. List open identity, visible-content, or release URL dependencies. A brief recommendation gives no rich-result eligibility assessment.

## Delivery checklist

- The site can credibly cover the page task and the cluster has a clear page owner, or ownership remains an explicit open item. An update records retained content and the current URL.
- Research shows scope and actual coverage. Evidence-backed observations support the format and proposed depth. Comparable length estimates share a basis. Unknowns have a verification action.
- The information gain is specific and grounded in the inspected sample. Priority gaps, accepted buyer questions, planned assets, and evidence items point to outline sections. Outline budgets broadly reconcile with the total range.
- Metadata, terminology, CTA, and link targets suit the buyer and market. Verified destinations and pending paths are identifiable. Parameter tables specify conditions, units, and sources.
- The evidence list distinguishes public claims from first-party claims. All first-party claims have applicable proof or specific placeholders. Schema rows name visible-content and evidence prerequisites.
- Set a shared artifact `<slug>` for the brief and, when writing follows, the draft. Use lowercase ASCII letters, digits, and single hyphens. Base it on the topic with a page or market qualifier where needed. Use readable romanization for topics without an ASCII form. Check both `drafts/<slug>-brief.md` and `drafts/<slug>.md` for collisions. Update a matching artifact on an explicit revision and preserve unrelated files. Otherwise use an available numeric suffix. Keep the artifact slug in the brief and distinguish it from the publication path.
- Save the checked brief to `drafts/<slug>-brief.md`. Read it back and check that the sections, references, and slug match the intended delivery. State material limitations in the brief and the handoff.
