# Hreflang Return Links and x-default Checklist

## Draft appendix

- Map variants serving the same procurement task and product scope. List the source, target, verified other languages, and intended fallback. Record the actual language, proposed or published URL, and status. Confirm page URLs and publication status directly.
- Use canonical BCP 47 forms for file locales, such as `en-US`, `de-DE`, and `zh-Hant-TW`. Verify hreflang separately against Google’s supported language, optional script, and optional country codes. Use lowercase language, title case script, and uppercase region. Avoid `en-UK` (use `en-GB`), `de-EU`, region-only codes, and duplicate language tags. For unsupported locales, document the limit and propose a mapping only when the target scope warrants it. Use `x-default` for the fallback.
- Put the same set of alternates on all confirmed equivalent variants, with self and return links. Use final public absolute HTTP(S) URLs aligned with the intended canonicals. Different-language pages generally use their own canonicals. Check same-language near-duplicates against the site’s canonical policy.
- Use at most one optional `x-default` per group, pointing to the confirmed equivalent default or relevant language selector. Two tags can share a URL when the fallback is itself a verified language variant. For a separate fallback page, include matching return links there too. Mark unconfirmed fallback policy as pending.
- Follow the site’s existing HTML, HTTP header, or XML sitemap method. For HTML, add the following tags to each variant’s `<head>`. Include a fenced suggestion after the Markdown draft. Clearly mark unknown URLs or languages as placeholders for completion before deployment. Include confirmed variants and pending entries only where they correspond to this draft.

```html
<link rel="alternate" hreflang="en-US" href="{SOURCE_CANONICAL_URL}">
<link rel="alternate" hreflang="de-DE" href="{TARGET_CANONICAL_URL}">
<link rel="alternate" hreflang="x-default" href="{CONFIRMED_FALLBACK_URL}">
```

The example maps `en-US` to `de-DE`. Substitute the actual languages and URLs. Use an explicit placeholder when the source language is unknown. Omit the third line pending confirmation of the fallback and record it in the summary.

## Post-deployment checks

- [ ] Confirm each final URL returns `200` and is crawlable and eligible for indexing. Check canonical, response headers, and page robots rules. Verify scheme, host, path, and trailing slash against the map. Point production links to the final page.
- [ ] Check self and return alternates, language codes, and the `x-default` target. Verify return links across domains. Verify the complete mapping in the site’s chosen deployment method, whether HTML `<head>` tags, HTTP response headers, or an XML sitemap.
- [ ] For public HTML, pass the available full HTML from `seokit_fetch_page` to `seokit_parse_seo` in the same Codemode script. Check the final URL, status, canonical, and hreflang declarations. The parser resolves relative links, so inspect raw `href` values to verify that they are absolute. Check tag location and any deployment methods the tool may miss. Mark inaccessible pages unverified, and record passes only for checks performed.

[Google Search Central localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions) · [Google Search Central x-default guide](https://developers.google.com/search/blog/2023/05/x-default)
