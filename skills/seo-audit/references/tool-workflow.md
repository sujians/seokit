# 工具执行流

先用普通工具调用或在 `codemode` 中尝试 `seokit_load_profile({})`。普通调用显示档案 JSON，脚本调用收到文本。报告只引用与页面相关的业务上下文，避免复制整份档案。

四个分析工具的结构化数据可在 Pi 的 `codemode` 中直接传递。现有会话如果未提供该工具，先完成能直接调用的检查，并注明需以 `pi --tools +codemode` 启动后才能传递完整 HTML 和原始 JSON-LD。普通调用显示的是摘要，摘要不能用作分析输入。

脚本中的 `url` 使用经过验证的用户 URL，在 JavaScript 中将其作为字符串传值。以下调用在同一脚本中执行。只输出报告所需的证据，必要时调整摘要范围以核对具体候选问题。

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
  return "响应未提供可分析的成功 HTML。";
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

- 抓取异常时记录工具错误。遇到 429、超时或访问拒绝，保留本次观察和后续验证条件，停止扩展抓取。若返回截断 HTML，缺项、计数和分数仅基于片段，依赖完整正文或完整标记的检查记为未验证。
- 检查 `X-Robots-Tag`、robots meta 和 canonical 时说明适用爬虫及最终 URL。解析器提供页头 HTML 标签，HTTP `Link` 和站点地图也可承载 canonical 或 hreflang。站点地图声明只能证明发现了入口。对未访问的 canonical 或 hreflang 目标，仅描述声明。双向 hreflang 和目标状态需另行核对。
- 检查工厂文件、采购字段和询盘入口时，按需在脚本内从 `html` 输出有限的正文片段和相关标签，例如产品参数表、语言切换、资质链接和询盘入口。GEO 摘录和字符串匹配只覆盖部分内容。页面内容未可靠核对时记为未验证。记录表单和询盘链接的可见性，端到端提交状态需要单独验证。
- 复核 robots 结果前确认返回未截断，且摘要包含做出判断所需的规则。Googlebot 需从匹配的专用规则组或通配组判读。发现抓取请求成功只说明审计客户端可访问，实际爬虫访问还受 CDN/WAF 和平台规则影响。
