# Scoring, Priorities, and Reporting

## B2B technical SEO and GEO weights

Use these weights for one page and its origin policy. Determine applicable checks from page type, then record scores and evidence. Product, application, factory, and inquiry pages serve different buyer tasks.

| Dimension | Weight | Checks and points | Primary evidence |
| --- | ---: | --- | --- |
| Access and index eligibility | 25 | Final HTTPS response and usable HTML (10). Googlebot path rules and indexing directives (10). Canonical consistency (5). | Status, redirects, content type, matching robots rules, headers, and HTML metadata |
| Language and market | 15 | Primary language, industry terms, and market intent align (8). For multilingual pages, hreflang codes, targets, return links, and canonical consistency (7). | Profile or user-defined market, body, HTML or HTTP declarations, and checked variants |
| On-page signals and navigation | 15 | Title and description fit topic and intent (5). Clear heading hierarchy and identifiable main topic (5). Useful alt text and discoverable related internal links (5). | Metadata, headings, images, links, and context |
| Procurement information and verifiable evidence | 20 | Specific information for the buyer task (10). Traceable key specifications or qualifications (5). Clear procurement next step (5). | Models, materials, units, tolerances and conditions, application limits, certification scope or public documents, and sample, OEM/ODM, or inquiry paths as applicable |
| Structured data | 10 | Syntactically valid JSON-LD aligned with current search policy for applicable entities (5). Visible content alignment and applicable Product additionalProperty, manufacturer, and hasCertification, or Organization sameAs (5). | JSON-LD count, validation issue paths, visible copy, and organization or product evidence |
| GEO citability | 10 | Scale the seokit_score_geo score from 0–100 to 0–10. | Direct answers, tables and lists, data and standards, clarity subscores, and excerpts |
| AI search crawl policy | 5 | Current path rules match confirmed policy for relevant automated search crawlers (5). | Matching paths for OAI-SearchBot, Claude-SearchBot, PerplexityBot, and others, and confirmed search goals |

- Score verified checks as pass (100%), partial (50%), or fail (0%). Explain which criteria a partial result met and where it fell short. Mark applicable checks unverified when evidence is insufficient, for example when an hreflang declaration is available but the destination status or return relationship is unknown. Hreflang may be inapplicable on a single-language site with no regional alternatives. Mark unknown market, page ownership, and crawler policy unverified.
- Sum points earned on verified checks. Calculate score as points earned ÷ verified weight × 100 and coverage as verified weight ÷ applicable weight × 100, both to one decimal place. Record points, weight, status, and evidence by check. For applicable weight 93, verified weight 80, and 60 points, report 75.0/100 and 86.0% coverage. Label scores with unverified checks partial. Report coverage only when verified weight is zero. For a sample of several pages, report scores and scope per page.
- Mark on-page checks unverified when truncation, error or challenge responses, or client-side rendering prevent verification. Report observed HTTP, redirects, and crawl policy where available. Show the GEO tool score separately as a measure of textual citation signals. Verify standards, numbers, and attributions against scope, conditions, and sources.
- Inquiry-only products may omit public price and Offer markup. Propose adding specifications, manufacturers, certifications, or official entity links only when verified and suitable for publication. Relate rich-result availability to its specific search presentation. Record training policy, on-demand access, and llms.txt presence as policy observations.

## Priorities

| Priority | Trigger | Example |
| --- | --- | --- |
| P0 blocker | Evidence shows that a target is inaccessible or that an intended indexed page has a clear crawl or index blocker. | A confirmed active product page returns 404 or persistent 5xx, or an effective noindex conflicts with confirmed index goals. Identify a Googlebot path block as a crawl issue. |
| P1 high impact | A verified problem affects market discovery, buying decisions, or an inquiry path. | A broken hreflang return link, missing critical units or conditions, invalid JSON-LD, or unintended restrictions on a target AI search crawler. |
| P2 improvement | Evidence supports an improvement to wording, accessibility, or citability. | Rewrite a vague heading, move related specifications and units into a labeled table, or add informative alt text to a product image. |

Report isolated timeouts, rate limits, access challenges, and unknown policy intent with retest steps. Base P0 on evidence and the affected task. Consolidate common causes and order findings within a tier by business impact.

## Report structure and file path

1. **Scope and findings.** Record time and time zone, input and final URLs, redirects, sampled pages, profile mode, target market, and page type. Lead with the most important verified findings.
2. **Checks and scores.** Report observed HTTP, index directives, canonical, hreflang, page signals, procurement evidence, JSON-LD, and GEO. Include dimension scores and coverage. Record origin, tested path, crawler role, matched rule, access result, and policy assessment. Include status and final URLs for robots.txt and llms.txt.
3. **P0 blockers, P1 high-impact findings, and P2 improvements.** Include the affected URL and observed response field, tag, rule, or excerpt. Explain buyer or search impact, corrective action, and retest criteria. Mark a tier with zero verified findings as “None confirmed.”
4. **Unverified items and sources.** List evidence gaps, checks needed, publicly citable company evidence, and authoritative sources. Note tool errors and truncation.

Save to `audits/<domain>-<date>.md`. Use the lowercase ASCII hostname from the final URL, including its subdomain. If the final URL is unavailable, use the requested hostname. For IPv6, remove brackets and replace colons with hyphens. Use the run date in YYYY-MM-DD format. Append a timestamped entry with the URL when the same-day file exists. Include only relevant response fields and excerpts, and remove tokens, credentials, session identifiers, and private inquiry details. Read back the written entry.
