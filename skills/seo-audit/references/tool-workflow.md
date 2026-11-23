# Audit Tool Workflow

Start with `seokit_load_profile({})` directly or in `codemode`. A direct call displays the profile JSON, and a script receives text. Include only relevant business context in the report.

Use Pi `codemode` to pass structured data among the four analysis tools. If the tool is unavailable, run checks that can execute directly and state that `pi --tools +codemode` is required to pass the full HTML and raw JSON-LD. Direct calls show summaries. Use the structured results as analysis input.

Use the verified user URL as the JavaScript string `url`. Run the calls below in the same script. Output the evidence needed for the report and adjust the summary to verify individual findings.

```js
let page;
try {
  page = await tools.seokit_fetch_page({ url });
} catch (error) {
  text({ tool: "seokit_fetch_page", error: String(error) });
  return;
}
const { html, headers, robots, ...response } = page;
const { groups, ...crawl } = robots;
text({
  ...response,
  htmlCharacters: html.length,
  headers: { "x-robots-tag": headers["x-robots-tag"], link: headers.link },
  robots: { ...crawl, groups: groups.filter(({ userAgents }) =>
    userAgents.includes("googlebot") || userAgents.includes("*")).map(({ userAgents, rules }) =>
    ({ userAgents, ruleCount: rules.length, rules: rules.slice(0, 25) })) },
});

const isHtml = /^(?:text\/html|application\/xhtml\+xml)\b/i.test(page.contentType ?? "") ||
  (!page.contentType && /^\s*(?:<!doctype\s+html|<(?:html|head|body)\b)/i.test(html));
if (page.status < 200 || page.status >= 300 || !html.trim() || !isHtml) {
  return "The response did not contain usable HTML from a successful request.";
}

let seo;
try {
  seo = await tools.seokit_parse_seo({ url: page.url, html });
  const { jsonLd, headings, ...metadata } = seo;
  text({ ...metadata, headingTotal: headings.length, headings: headings.slice(0, 25),
    jsonLd: jsonLd.map(({ index, parseError }) => ({ index, parseError })) });
} catch (error) {
  text({ tool: "seokit_parse_seo", error: String(error) });
}
if (seo) {
  try {
    const schema = await tools.seokit_validate_schema({ blocks: seo.jsonLd.map(({ raw }) => raw) });
    text({ ...schema, issueCount: schema.issues.length, issues: schema.issues.slice(0, 25) });
  } catch (error) {
    text({ tool: "seokit_validate_schema", error: String(error) });
  }
}
try {
  text(await tools.seokit_score_geo({ html }));
} catch (error) {
  text({ tool: "seokit_score_geo", error: String(error) });
}
```

- Record fetch errors. Stop expanding the crawl after rate limiting, timeout, or access denial, and record what would verify the observation. If HTML is truncated, scope omissions, counts, and scores to the returned excerpt. Mark checks that require the complete body or markup unverified.
- Specify the applicable crawler and final URL when evaluating `X-Robots-Tag`, robots meta tags, and canonical. The parser reports HTML metadata. HTTP `Link` headers and sitemaps can also declare canonical or hreflang. A sitemap entry shows a discovery path. Describe unvisited canonical and hreflang targets as declarations, and separately verify return links and destination status.
- For factory documentation, procurement fields, and RFQ paths, extract limited excerpts and tags from `html` as needed, including specification tables, language selectors, certification links, and inquiry links. GEO excerpts and string matches cover only part of the page. Mark unconfirmed content unverified. Report visible forms and inquiry links. Verify submission separately.
- Check truncation and confirm that the robots summary includes the applicable rules. Determine Googlebot access from the matching dedicated or wildcard group. A successful fetch shows that the audit client could access the page. Crawler access also depends on CDN, WAF, and platform policies.
