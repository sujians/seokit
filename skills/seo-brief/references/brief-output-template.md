# B2B Brief Output Template

Use these sections to give the writer a readable plan. Keep notes as short as the topic allows. Link sources and name the relevant headings or claims in plain language. Use short IDs only when they simplify a reference shared across sections. Record material unknowns and their next action.

## Content Brief — [primary query]

### 1. Page Task and Search Intent

- Primary query, reader role and knowledge level, market, language, core search question, and next action.
- Search intent, B2B intent category, dominant result formats, confidence, and reasons for choosing the page type.
- Create or update mode, current page or proposed site path, cluster and page ID, hub or spoke role, and applicable profile or generic-mode limits.
- Research scope with query, provider or search location, language, device, date, and any observed SERP feature. Note optional keyword metrics and their scope.

### 2. SERP and Competitor Structure

| Query and organic rank | Final URL and format | Main H2s and relevant H3s | Technical depth, evidence, assets and CTA | Coverage or failure |
| --- | --- | --- | --- | --- |

Summarize the scope and limitations of the sample. Include the current-page inventory in update mode and record what to retain, strengthen, and add. Comparable prose lengths are optional context. Where forums, dead links or irrelevant redirects, listings, or incomplete articles dominate, describe the weak sample and base article length on the sections required to cover the core sub-intents.

### 3. Gaps and Information Gain

| Reader question or gap | Observed pages and headings | What the planned section adds |
| --- | --- | --- |

State the new explanation, worked example, or decision aid and the source it needs, if any. If a factory-specific example needs evidence, plan a public-method example or checklist that still serves the reader.

### 4. Search Terms and Technical Entities

| Term and role | Preferred target-language term, synonym or abbreviation | Reader relevance and source | Outline section and placement | Scope note |
| --- | --- | --- | --- | --- |

Cover the primary query, relevant secondary queries, and needed technical terms. Include entities such as products, processes, materials, standards, parameter names, units, and application conditions as applicable. Flag terms that imply an unverified capability or certification. Use the profile glossary where applicable.

### 5. PAA and Procurement Objections

| Question | Observed PAA, buyer record, public source, or inference | Answer direction and placement |
| --- | --- | --- |

Record dates and query scope for observed PAA. Prioritize the technical questions and procurement objections that matter for the topic. Plan a short standalone FAQ by default when questions recur or readers commonly confuse versions or concepts. Plan direct 40–60-word answers and keep essential explanations in the main sections as well.

### 6. Tables, Visuals, and Interactive Assets

| Asset and section | Decision it supports | Rows or inputs, outputs, units and valid conditions | Source and status | Caption, alt text or accessible fallback notes |
| --- | --- | --- | --- | --- |

Plan a meaningful table when it helps readers compare parameters, understand defects, or apply acceptance criteria. Use public methods for a generic checklist or comparison and label illustrative values. A customer work order is needed only if the draft makes claims that rely on it. Add relevant dimensioned drawings, installation diagrams, inspection images, charts, or RFQ worksheets. For a useful selector or calculator, specify inputs, assumptions, valid ranges, source, outputs, and a static equivalent. Flag approval, redaction, and development needs. Mark other assets optional when the table and text cover the task.

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

List H2s and H3s in reader order. Estimate depth from the rules, worked examples, tables, and questions each section needs. Use flexible prose ranges where they help. With a weak SERP, the sections needed to cover all core sub-intents determine the length. For informational topics, allocate at least 80% to core technical content, including technical FAQ answers. Keep conversion content at or below 20%, preferably 10–15%, counting DFM handoff, procurement submission checklists, service descriptions, and inquiry CTAs. For procurement guides, product pages, and selection comparisons, prioritize objective parameters and selection logic and trim supplier workflow copy.

Place any standalone FAQ after the technical sections and the concise DFM or procurement handoff, immediately before the closing CTA when present.

| H2 or H3 | Reader question and planned answer | Example, format, source note, or next action |
| --- | --- | --- |

For updates, mark sections to retain, strengthen, or add. Give the writer enough detail to explain rules, limits, and practical examples without reconstructing the research.

### 10. Evidence Handoff for seo-write

- **Established industry knowledge:** Explain common designation syntax and suffix conventions, formula concepts, rotation rules, and familiar defect mechanisms in detail. Plan original worked examples and practical tables or checklists. Use a short note to check the applicable edition and product data sheet when conventions vary. Avoid reproducing complete protected standards tables.
- **Specific public facts:** Verify edition-specific clauses and limits, quantitative material properties, formal test requirements, and regulatory obligations against authoritative sources. Put a short source note by the claim or planned section. When exact requirements are inaccessible, hand off the public explanation and identify the specific rule or value to verify.
- **Factory-specific claims:** Use `profile/profile.yaml` or user-provided materials for factory yield, tolerance capability, lead time, certificate numbers, and customer cases. Note relevant scope and disclosure limits. Use `[Factory evidence needed: specific material and scope]` for missing proof. Identify optional evidence that can follow a complete draft. Keep private material in the working notes.

### 11. Schema Handoff for seo-schema

| Recommended Schema.org type | Entity and planned visible section or navigation | Supporting evidence | Prerequisite or reason to omit |
| --- | --- | --- | --- |

Recommend only types relevant to the planned page and supported by the [page type guidance](page-type-templates.md). List the actual model, organization, or breadcrumb path where applicable. Flag existing entity IDs or conflicting markup when observed. Leave generation, visible-content checks, and validation to `seo-schema`. List open identity, visible-content, or release URL dependencies. A brief recommendation gives no rich-result eligibility assessment.

## Delivery checklist

- The site can credibly cover the page task and the cluster has a clear page owner, or ownership remains an explicit open item. An update records retained content and the current URL.
- Research shows actual coverage and limitations. The outline covers the core questions at the depth they need, including a standalone FAQ when recurring confusion warrants one. Check the technical and conversion shares for informational topics and the closing placement of any standalone FAQ.
- The outline specifies the new explanation or decision aid and names sources and assets where needed. Use section names for handoff notes.
- Metadata, terminology, CTA, and link targets suit the buyer and market. Verified destinations and pending paths are identifiable. Parameter tables specify conditions, units, and sources.
- The brief distinguishes established industry knowledge, specific public facts, and factory claims. Factory claims have applicable proof or specific placeholders. Schema rows name visible-content and evidence prerequisites.
- Set a shared artifact `<slug>` for the brief and, when writing follows, the draft. Use lowercase ASCII letters, digits, and single hyphens. Base it on the topic with a page or market qualifier where needed. Use readable romanization for topics without an ASCII form. Check both `drafts/<slug>-brief.md` and `drafts/<slug>.md` for collisions. Update a matching artifact on an explicit revision and preserve unrelated files. Otherwise use an available numeric suffix. Keep the artifact slug in the brief and distinguish it from the publication path.
- Save the checked brief to `drafts/<slug>-brief.md`. Read it back and check that the sections, references, and slug match the intended delivery. State material limitations in the brief and the handoff.
