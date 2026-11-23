# B2B Competitor Analysis and Comparison Template

## Sample selection and evidence

- Deduplicate supplied URLs in order. For keyword-only requests, select a target country and search language from the request and profile. Clarify the scope if several markets fit. Use a DataForSEO country name or code for `location` and a supported `language_code` such as `en`. Default to desktop unless specified.
- Call `seokit_dataforseo_serp({ location, language_code, keywords: [keyword], top_n: 10, device, dry_run: true })`. If `available: true` and `sandbox: false`, repeat without `dry_run`. For sandbox data, follow the skill’s URL fallback. Pi confirms costs above USD 0.50. Record query, country, language, device, `observedAt`, `searchUrl`, and organic `rank` where available. Record supplied URL provenance and leave rank blank.
- Select 1–3 relevant pages in organic rank order from `results[].organic`. Skip the project site, duplicate landing pages, `unresolved_goto: true`, and unverified redirects. Prefer different suppliers. Include directories, resellers, or media when relevant and record their roles. Deduplicate by final URL and record skips and evidence limits. Sample only selected pages and directly relevant public sources.

Pass each absolute HTTP(S) `url` to the same Pi `codemode` script. Run samples independently so one failure preserves the rest.

```js
let page;
try {
  page = await tools.seokit_fetch_page({ url });
} catch (error) {
  return { url, analyzed: false, fetchError: String(error) };
}
const { html, status, contentType, truncated } = page;
const response = { requestedUrl: url, finalUrl: page.url, status, contentType, truncated };
const isHtml = /^(?:text\/html|application\/xhtml\+xml)\b/i.test(contentType ?? "") ||
  (!contentType && /^\s*(?:<!doctype\s+html|<(?:html|head|body)\b)/i.test(html));
if (status < 200 || status >= 300 || !isHtml || !html.trim()) {
  return { ...response, analyzed: false };
}
const [seo, geo] = await Promise.allSettled([
  tools.seokit_parse_seo({ url: page.url, html }),
  tools.seokit_score_geo({ html }),
]);
return {
  ...response,
  seo: seo.status === "fulfilled" ? {
    title: seo.value.title,
    headingCounts: seo.value.headingCounts,
    headings: seo.value.headings.filter(({ level, text }) => level <= 3 && text)
      .slice(0, 30).map(({ level, text }) => ({ level, text: text.slice(0, 200) })),
    links: seo.value.links,
    baseUrl: seo.value.baseUrl,
  } : { error: String(seo.reason) },
  geo: geo.status === "fulfilled" ? geo.value : { error: String(geo.reason) },
};
```

- Verify copy and documents with a page reader or extract short relevant passages, table rows, certificate links, and form entries. Resolve relative links against the final URL or applicable `baseUrl`. Confirm anchor, placement, and destination. Scope observations to the returned counts, excerpts, matches, and snippets.
- Record evidence and gaps for truncation, script-only bodies, access restrictions, and errors. If `codemode` is unavailable, record HTTP evidence and use a page reader with stated limits. Review public CTA links and visible fields only. Leave forms, quote requests, and authenticated content untouched.

## Page-by-page analysis

| Dimension | What to check | Evidence |
| --- | --- | --- |
| Type and structure | Identify product, category, process, application, comparison, or alternatives pages. Map each to selection, RFQ, or supplier review. | Title, H1–H3, and body module order, distinguishing navigation and footer. |
| Specification transparency | Check models, material grades, dimensions, tolerances, performance, test conditions, drawings, MOQ, and lead times. Distinguish disclosed values, options, and items for RFQ. | Table rows with units and scope, product or document links, revision or date. |
| Certifications and proof | Check holder, site, products, scope, and validity. Distinguish standards, declarations, tests, and certifications. Qualify case studies. | Certificate ID and issuer record, page claims, or public cases. Mark badges and unchecked claims as publisher disclosures. |
| CTA path | Locate quote, sample, drawing, selection support, and contact entry points. Record placement, link, visible steps and fields, uploads, and requirements. | Exact CTA, public destination, page location, visible fields, and review scope. |
| Internal links | Check navigation, breadcrumbs, contextual links, and footer destinations for products, processes, documentation, cases, and inquiry. | Whole-page counts plus representative anchors, positions, and destinations. |
| GEO citability | Check standalone conclusions, values with units and conditions, tables or lists, and sourcing. | `seokit_score_geo` heuristic, signals for direct answers, structure, evidence, and clarity, and short excerpts. Platform citations need separate observation. |

For each item, give URL, verification date, and locatable section, table, or document. Use observed, publisher claim, absent in checked sample, or unverified. Use unverified for errors, truncation, login gates, or dynamic content outside observed scope.

## Gap report

1. **Scope and sample.** Record topic, market, language, buyer task, project context, queries or supplied URLs, input and final URLs, ranks if known, types, and fetch status. State if a comparable first-party page and profile are available.
2. **Page evidence.** Record observations, limits, and traceable sources for each dimension. Qualify findings from one page or version.
3. **Priorities.** Rank changes by impact on selection, supplier qualification, or RFQ. Give competitor evidence, first-party evidence or open checks, impact, placement, dependencies, and retest. Without a first-party baseline, describe opportunities and checks.
4. **Evidence gaps.** List specs, certifications, CTAs, and links needing verification and the exact materials to check. Keep pending comparison facts here or in draft editorial notes.

## Comparison or alternatives page

1. **Title and opening answer.** Use “Model A vs Model B for [conditions or buyer task]” or “Alternatives to [subject] for [conditions or requirements].” State where each option fits and what buyers should confirm. Disclose publisher relationships, sources checked, date, and test basis. Describe measurements only with evidence.
2. **Scope and matrix.** State models, revisions, market, conditions, configurations, and comparison basis. Use consistent rows for materials, tolerances, performance, tests, compliance, interfaces, and sourcing terms. Cite material values. Compare quotes only under comparable currency, volume, configuration, delivery, and timing. Label different conditions and mark unavailable or unverified values.

   | Selection criterion | Option A (model or configuration) | Option B or alternatives | Comparable conditions and open checks |
   | --- | --- | --- | --- |
   | [Measure and unit] | [Public value, conditions, source] | [Public value, conditions, source] | [Shared conditions or verification needed] |

3. **Buyer trade-offs.** Address fit, acceptance, and verification effort for engineers, and supply, records, and RFQ terms for purchasing. For each alternative, state uses and required interface, quality, or sample checks. Keep compatibility conditional on verification. State evidence-backed strengths and limits for each option.
4. **Next steps and sources.** List practical checks such as supplying a drawing, confirming tolerance and test conditions, or requesting a model-specific record or sample. Use verified procurement CTAs and descriptive anchors. Cite titles, revisions, dates, and public URLs near claims. Remove editorial notes and recheck time-sensitive facts before publishing.

Prefer manufacturer data sheets, publishers, regulators, and certification registries. Verify and cite public standards, material properties, and testing. Check first-party claims with profile or user evidence and apply `terminology.banned_phrases[].phrase`. Include publicly supportable comparisons and flag editorial gaps `[TODO: specify evidence]`. Use conditional buyer questions for unresolved items. Require verifiable proof of defects, tests, certifications, reviews, affiliations, and endorsements. Draft named comparisons only for verified entities with a shared buyer task.

## File names and verification

- Derive the slug from the keyword or first supplied URL host and path, ignoring queries and fragments. Apply Unicode NFKC, lowercase, replace runs other than letters, numbers, and combining marks with one hyphen, trim hyphens, and limit to 48 Unicode code points. Trim a trailing hyphen again. Use `competitor` if empty.
- Verify paths under `audits/` and `drafts/`. Use the same available numeric suffix for both outputs if needed. Read back samples, sources, gaps, actions, comparable conditions, and neutral phrasing. Return actual paths.
