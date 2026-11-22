# Hreflang 互指与 x-default 检查清单

## 成稿附录

- 建立同一采购任务、同一产品范围的版本映射。列出源稿、目标稿、已确认的其他语言版本及预定回退页。逐项记录实际语言、拟用或已发布 URL 与状态。站点根域、文件名和档案中的市场列表都不足以推导单页 URL 或确认版本已发布。
- 文件 locale 使用规范化的 BCP 47 形式，如 `en-US`、`de-DE`、`zh-Hant-TW`。另按 Google 支持的语言、可选文字系统及可选国家/地区代码检查 hreflang。语言小写、文字系统首字母大写、地区大写。避免 `en-UK`（英国使用 `en-GB`）、`de-EU`、地区单独编码及重复语言标签。遇到 hreflang 不支持的 locale，说明限制并仅在目标范围确有依据时提出映射。`x-default` 用于回退配置。
- 在所有已确认的等价版本放同一套 alternate，每页列自己并互相返回。各 href 使用最终公开的绝对 HTTP(S) URL，与该版本拟用的规范 URL 对齐。实际语言显著不同的版本通常各自 canonical；同语言近重复版本按站点的 canonical 策略校核，避免信号互相冲突。
- 可选 `x-default` 每组最多一条，指向已确认的等价默认内容或适合该任务的语言选择页。若回退 URL 本身就是某个已确认语言版本，可让两个标签共享 URL。若回退是独立页，建议在该页也配置对应的返回关系。回退策略未确定时标注待定。
- 首选沿用站点已有的 HTML、HTTP 响应头或 XML sitemap 方式。HTML 方式把以下标签放在各版本的 `<head>`。Markdown 稿末用围栏展示建议。URL 或语种待确认时，用明显的占位符并标注「待填，勿部署」。映射中仅保留已确认的语言和确为本稿对应版本的待填项。

```html
<link rel="alternate" hreflang="en-US" href="{SOURCE_CANONICAL_URL}">
<link rel="alternate" hreflang="de-DE" href="{TARGET_CANONICAL_URL}">
<link rel="alternate" hreflang="x-default" href="{CONFIRMED_FALLBACK_URL}">
```

以上是源语言为 `en-US`、目标为 `de-DE` 的示例。按实际映射替换语言和 URL。源语种未知时用明确的语言占位符。没有确认的回退时，示例中省略第三行，在摘要记录待定。

## 上线后逐项验收

- [ ] 逐 URL 确认最终响应为 `200`、可抓取且具备索引资格。核对 canonical、响应头和页面 robots 规则。协议、主机、路径、尾斜杠与 URL 映射一致。生产链接直接指向最终页。
- [ ] 检查 alternate 自指、互指和语言代码，以及 `x-default` 的去向。跨域版本也检查回链。确认 HTML 标签在 `<head>`，或站点选用的响应头或 sitemap 返回完整对应关系。
- [ ] 公开 HTML 可用 `seokit_fetch_page` 与 `seokit_parse_seo` 在同一 Codemode 脚本传递完整 HTML，核对最终 URL、状态、canonical 和 hreflang。解析器会解析相对地址，仍须检查原始 `href` 是否为绝对 URL。核对标签所在位置及工具可能漏掉的部署方式。无法获取公开页时记录「未验证」，只有实际检查的项目才标记通过。

[Google Search Central 本地化版本指南](https://developers.google.com/search/docs/specialty/international/localized-versions) · [Google Search Central x-default 指南](https://developers.google.com/search/blog/2023/05/x-default)
