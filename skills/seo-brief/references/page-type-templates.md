# B2B Technical and Procurement Page Templates

Choose the template that fits the primary search task. Use these rows to plan sections, depth, and supporting material. The product and capability templates suit model qualification and supplier evaluation. Apply the informational structure below when the query primarily asks how a standard, process, or selection rule works.

## Informational Technical Queries

For standards references, process principles, and selection explainers, devote at least 80% of the article to core technical content. Define the concept and its limits, explain relevant versions or changes, walk through the rules or calculation, and include a worked example. Cover common mistakes and use a short standalone FAQ when readers commonly confuse versions or concepts. Include that FAQ in the technical portion.

Keep conversion content at or below 20% of the article, preferably 10–15%. Count the DFM handoff, procurement submission checklist, service descriptions, and inquiry CTA toward that share. Keep the handoff short and place any standalone FAQ after it, immediately before the closing CTA. For example, a component naming guide should explain the syntax, common suffix patterns, and how to decode a sample designation before asking for a BOM and drawing review. A welding explainer can give a generic defect-to-cause and inspection table using public technical practice. Use a factory record only when claiming an actual factory result or customer case.

For product pages, selection comparisons, and procurement guides, make objective specifications, qualification criteria, and selection logic the main content. Condense supplier workflows and keep any commercial next step focused on the buyer's decision.

## B2B Product Page

**Buyer task:** Qualify a model or configurable family for a defined duty, then request a quote or sample. Usually a procurement page with technical qualification content.

| Section | Decision and format | Evidence to verify |
| --- | --- | --- |
| Model and operating envelope | Identify intended use and exclusions. Give the buyer a short fit check before the details. | Model identifiers, operating conditions, and versioned limits. |
| Configuration and specifications | Compare options in a model-by-parameter matrix. Include dimensions, duty or output basis, tolerances, materials, power or voltage, interfaces, and relevant units. Add a dimensioned drawing where useful. | Model-specific drawings, data sheets, methods, and revisions. Verify public technical standards separately. |
| Testing and compliance | Show which models and conditions each test or certification covers. Flag evidence a buyer needs for the target market. | Issuer, document ID, standard edition, covered model or plant, and validity or test conditions. |
| Supply, support, and RFQ | List confirmed MOQ, sampling, lead time, warranty or service scope when relevant. Show which model, configuration, quantities, intended use, and destination to send. | Applicable supply and support terms, delivery basis, and inquiry path. |

**Information gain to investigate:** A documented selection matrix that connects duty and interface conditions to supported configurations, with a check for values needing a drawing review.

**Schema candidates:** `Product` for a clearly identified visible product and `Organization` for its verified manufacturer. Review `BreadcrumbList` if the page has confirmed navigation. Flag inquiry-only status for the schema handoff.

## Manufacturing Process Capability Page

**Buyer task:** Decide whether a supplier can make the part, prove conformity, and deliver the required lot volumes. Usually an engineering or supplier qualification page.

| Section | Decision and format | Evidence to verify |
| --- | --- | --- |
| Work within scope | List process, materials, geometries, part or lot sizes, and conditions that require review. | Factory-specific equipment, tooling, and confirmed scope. Use public sources for process principles. |
| Capability and throughput | Tabulate operation, material, part size, tolerance, run or output basis, and exceptions. Call out where material, geometry, or setup changes the range. | Tooling and equipment scope, measured capability, sample basis, and inspection method. |
| Validation and production | Map drawing review, first article or sample approval, inspection, traceability, and ongoing production verification. Plan a process diagram or anonymized inspection excerpt if it helps. | Approved procedures, redacted records, and applicable references or acceptance methods. |
| Technical review request | List required drawing revision, critical dimensions, batch size, materials, application, and acceptance criteria. | Verified review channel, documentation requirements, and disclosure policy. |

**Information gain to investigate:** An approved capability table distinguishing drawing-screening limits from tolerances supported by inspection records under stated conditions.

**Schema candidates:** `Organization` for the identified operator or facility context when visible, and `BreadcrumbList` when navigation is verified. Consider `HowTo` for actual user-actionable steps only when explicitly requested or a known consumer needs it.

## Selection or Comparison Page

**Buyer task:** Choose a material, process, design, or equipment configuration for defined conditions. Use MOFU or BOFU according to the decision and observed format.

| Section | Decision and format | Evidence to verify |
| --- | --- | --- |
| Fit by operating condition | Give a conditional short answer for each important use case and the point at which it needs verification. | Buyer scenario, verified thresholds and conditions, and appropriate authoritative sources. |
| Comparable parameters | Plan a matrix with options, units, conditions, specimen or equipment configuration, method, and source. Flag noncomparable or missing values. | Current standards, primary data sheets, test methods, and valid comparison bases. |
| Trade-offs and exceptions | Explain where conclusions change with safety, maintenance, compatibility, cost drivers, or production constraints. Plan a diagram or documented selector when useful. | Supporting sources, model limitations, application assumptions, and any verified calculation inputs. |
| Verify before purchase | Give model, drawing, sample, or test checks and link to the appropriate product or capability review. | Actual destinations, market requirements, and next-step evidence. |

**Information gain to investigate:** A decision matrix that shows where test conditions prevent a direct comparison and which sample checks resolve the choice.

**Schema candidates:** `BreadcrumbList` for verified navigation. Consider `Product` only for specific visible product entities that fit the actual page. Keep ratings, offers, and reviews out of the brief unless supported by applicable evidence.

## Industry Procurement Guide

**Buyer task:** Turn industry or application requirements into screening criteria, RFQ inputs, and acceptance steps. Usually an application guide that supports procurement.

| Section | Decision and format | Evidence to verify |
| --- | --- | --- |
| Define risks and requirements | Map application, operating conditions, destination market, and compliance questions to buyer requirements. | Actual use case, current rules, and authoritative standards scope. |
| Convert requirements to acceptance criteria | Plan a conditions-to-metrics table with units, inspection methods, acceptable records, and responsibility for approval. | Publishers, regulators, and applicable tests or specifications. |
| Compare and qualify suppliers | Provide a checklist for certificate scope, traceability, sampling, production readiness, substitution risk, capacity, and service. | Applicable authoritative requirements and first-party evidence for any named factory. |
| RFQ, samples, and incoming inspection | Plan an RFQ worksheet and buyer actions for sample approval, lead time, shipment, and acceptance. Link to relevant product and capability pages. | Buyer materials, accepted inspection practices, confirmed commercial terms, and verified destinations. |

**Information gain to investigate:** An RFQ-to-acceptance worksheet that maps each requirement to a test, evidence record, and responsible reviewer.

**Schema candidates:** `BreadcrumbList` for verified navigation. Consider `HowTo` only for actual instructions when explicitly requested or a known consumer needs it.

For any template, mention `FAQPage` only when the planned page has visible editorial questions and answers and a concrete downstream use calls for it. Record the entity, facts, and prerequisites for any suggested type and defer the markup to `seo-schema`.
