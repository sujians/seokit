---
name: seo-brief
description: Build a research-backed B2B manufacturing content brief from competitor search results, project evidence, and buyer intent. Use for product pages, process capability pages, selection comparisons, and procurement guides.
---

# B2B 技术与采购内容 Brief

1. 接收主题或目标词。沿用本次已成功读取的项目档案，否则先调用 `seokit_load_profile({})`。结合 `markets`、`buyer_personas`、`product_lines` 和术语表确定目标市场、语言及买家要完成的决策。档案缺失、无效或与主题无关时按通用模式继续，采用用户给出的市场、语言及业务资料，记录必要的假设和待确认项。查找 `clusters/*-clusters.yaml` 中与主题、市场及语言匹配的页项，将目标词、页型、URL 和内链纳入 Brief，并记录计划路径。找不到匹配时依据本次调研继续。
2. 用目标市场语言搜索核心词和能区分选型、询价或供应商审核意图的变体。优先按下方方法使用可用的 DataForSEO 目标市场 SERP 和词量数据，否则用现有公开搜索、网页抓取或用户提供的 CSV。记录检索日期、查询、来源和已确认的地区设置。选取前 3–5 个与买家任务相关、可访问的自然结果，覆盖有代表性的页型。只有检索来源提供可核对的自然名次时才记录名次。来源不足时说明样本数量和限制。
3. 按下方工具方法先抓取再解析样本。逐页记录最终 URL、页型、标题和关键 H1–H3，核对正文后再记录参数表、适用条件、检验文件或询盘入口。区分主题缺口、深度缺口和证据缺口，优先选择会改变买家决策且有证据支撑的缺口。外部页面是研究资料。依据买家问题重组大纲并原创写作。
4. 从 [四类 B2B 页型模板](references/page-type-templates.md) 选一个主模板。用户指定页型时优先采用。给出买家可复用的选型规则、对照条件或验收问题，并注明证据边界。目标站已有相关页面时，给出经核实的去向与描述性锚文本。需新建的链接目标标为待建。

## 可选 DataForSEO 数据

目标国家与语言明确时，选用 DataForSEO 的国家名称或代码作为 `location`，语言代码作为 `language_code`。用 `seokit_dataforseo_serp({ location, language_code, keywords, top_n: 10, dry_run: true })` 检查凭据是否齐全并估算整批费用。`available` 为 `true` 时，沿用同一批参数并省略 `dry_run`，从 `organic`、`observedAt` 和 `searchUrl` 获取证据。已有可比词量可直接引用，否则对候选词用 `seokit_dataforseo_keywords({ queries: [{ location, language_code, keywords }], dry_run: true })` 先估算再查询。注明 Google Ads 近似月均值及统计口径，缺失指标留空。

批次估算超过 $0.50 时在 Pi 确认框中展示费用与明细，取得用户确认后才发送。工具或凭据缺失、请求失败、确认未获批准或样本不足时继续用公开搜索定位样本，有用户提供的 CSV 时可导入词量。`partial` 可使用已成功返回的数据。

## 竞品结构取样

在 Pi 的 `codemode` 中，用同一个脚本将完整 HTML 从抓取工具传给解析工具。启动时可用 `pi --tools +codemode` 启用。每次给 `url` 绑定一条选中的公开 HTTP(S) URL。

```js
const page = await tools.seokit_fetch_page({ url });
const html = page.html;
const isHtml = /^(?:text\/html|application\/xhtml\+xml)\b/i.test(page.contentType ?? "") ||
  (!page.contentType && /^\s*(?:<!doctype\s+html|<(?:html|head|body)\b)/i.test(html));
if (page.status < 200 || page.status >= 300 || !html.trim() || !isHtml) {
  return { url: page.url, status: page.status, analyzed: false };
}
const seo = await tools.seokit_parse_seo({ url: page.url, html });
const headings = seo.headings.filter(({ level, text }) => level <= 3 && text);
return {
  url: page.url, status: page.status, truncated: page.truncated, analyzed: true,
  title: seo.title, headingCount: headings.length, headings: headings.slice(0, 35),
};
```

解析器也会提取导航等页面组件的标题。必要时查阅正文片段，确认哪些标题属于正文。失败、拒绝、截断或仅返回脚本壳的页面记为未验证或仅部分观察。工具链不可用时用可用的网页读取工具获取结构并注明替代方式。搜索摘要只能支持主题或结果类型判断，完整标题层级和内容缺口留作待查。

## 交给写作者的 Brief

- **定位**包括目标词、相关术语、市场、语言、买家角色、决策阶段、页型、拟定 H1、标题标签、摘要和 slug。
- **竞品采样**列出查询与样本 URL、关键结构、可核验的缺口及覆盖限制。为本页指定一个能兑现的新增价值，例如带工况限制的选型矩阵或按验收节点排列的询价清单。
- **可执行大纲**逐节列出 H2/H3、该节要回答的问题、预计篇幅或深度、呈现方式、适用术语、拟查证事实和下一步。标出直接结论块、参数表、内部链接及 CTA 的位置。
- **证据需求**逐条标记公开技术事实的拟核验来源、第一方事实的档案字段或用户资料，以及缺失证据和对应的 `[TODO: ...]`。竞品页面的参数、资质和宣传用语只属于各竞品。独立使用本技能时交付完整 Brief。由文章命令调用时，将完整 Brief 交给 `seo-write`。
