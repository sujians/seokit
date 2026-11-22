# AI 爬虫策略检查清单

## 爬虫用途

| 产品标识 | 用途 | 审计时核对的业务决策 | 官方资料 |
| --- | --- | --- | --- |
| GPTBot | OpenAI 模型训练 | 是否允许公开内容用于训练 | [OpenAI 爬虫](https://developers.openai.com/api/docs/bots) |
| OAI-SearchBot | ChatGPT 搜索 | 是否希望公开产品、应用和工厂页面可供搜索收录和展示 | [OpenAI 爬虫](https://developers.openai.com/api/docs/bots) |
| ChatGPT-User | 用户触发的页面访问，robots.txt 规则可能不适用 | 单独记录用户按需访问结果与限制 | [OpenAI 爬虫](https://developers.openai.com/api/docs/bots) |
| ClaudeBot | Anthropic 模型训练 | 是否允许公开内容用于训练 | [Anthropic 爬虫](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| Claude-SearchBot | Claude 搜索 | 是否希望页面具备 Claude 搜索可发现性 | [Anthropic 爬虫](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| Claude-User | 用户触发的页面访问 | 是否符合用户请求时的页面检索策略 | [Anthropic 爬虫](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| PerplexityBot | Perplexity 搜索 | 是否希望页面出现在搜索结果及来源链接中 | [Perplexity 爬虫](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) |
| Perplexity-User | 用户触发的页面访问，通常忽略 robots.txt | 单独核对对用户按需请求的访问策略 | [Perplexity 爬虫](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) |
| Google-Extended | Gemini 模型训练及部分 Gemini 产品的 grounding 控制。只在 robots.txt 中有独立令牌，与 Google 搜索排名和收录无关 | 确认业务对这两种用途的授权意图 | [Google 爬虫](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended) |
| Googlebot | Google 搜索抓取，包括搜索中的 AI 功能所依赖的抓取 | 确认公开入口可抓取，核对索引资格和摘要指令 | [Google 搜索 AI 功能](https://developers.google.com/search/docs/appearance/ai-features) |

## 查验步骤

1. **明确目标**。找出站方希望出现在搜索和 AI 检索中的公开产品、品类、应用或工厂能力页面。分别核对训练许可、自动搜索与用户触发访问。训练限制和按需访问限制按站方目标记录，意图未知时标待确认。
2. **按源站和路径核对**。记录最终页面的协议、主机、端口和测试路径（含查询串），以及 `/robots.txt` 的响应状态、最终 URL、是否截断。产品目录和语言子域名分别验证。网页结果显示 200 HTML 时留意软 404 或访问挑战。工具报告的 404/410 表示本次未发现规则文件。403、429、5xx、网络错误和截断需按平台的处理政策和可用证据判断。 [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html) · [Google robots.txt 处理规则](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)
3. **保留有效规则**。从 `robots.bots` 记录允许状态、专用组或通配组来源及匹配规则。Googlebot 使用 `robots.groups` 查看适用专用组，专用组存在时合并同名组，否则使用通配组。按路径匹配最具体的规则，同等具体时优先 `Allow`。应核对百分号编码、通配符和末尾锚点。规则集不完整或遇到复杂边界时，记录为待复验。 [Google 规则匹配与优先级](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt#order-of-precedence-for-rules)
4. **定位冲突**。只有自动搜索爬虫对目标公开页面的有效规则与确认的检索目标冲突才提出放行建议，修复应限定受影响爬虫与公开路径。实际平台访问依据站方日志、官方验证方法或公开爬虫 IP 复核。需要限制访问的合同价、图纸、测试记录和客户数据应通过登录或访问权限控制。 [Google 爬虫验证](https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests)
5. **检查 llms.txt**。记录 `llms.status`、`llms.url`、`llms.exists` 和截断情况。工具基于 HTTP 与响应形态探测存在性。内容、格式和链接需显式读取后才可评价。有维护需求时可选用该提案来指向稳定、公开的目录、规格、应用和资质页面。Google 搜索 AI 功能沿用搜索技术要求。 [llms.txt 提案](https://llmstxt.org/) · [Google 搜索 AI 功能](https://developers.google.com/search/docs/appearance/ai-features)
