---
name: seo-schema
description: 为 B2B 制造业网站的公开页面或本地草稿生成并校验 Schema.org JSON-LD，覆盖企业与工厂、询盘产品、FAQ、操作步骤和面包屑。
---

# B2B 结构化数据

先读 [B2B 模板、证据规则与工具执行流](references/b2b-schema-templates.md)。

1. 调用 `seokit_load_profile({})` 读取 `profile/profile.yaml`。核对档案与目标企业、工厂、产品型号及市场是否匹配。档案缺失、无效或不适用时，只使用可确认的页面事实和用户提供的适用证据，省略未核实的企业声明。
2. 公开 URL 用 `seokit_fetch_page` 抓取，在 Pi `codemode` 中将最终 URL 和原始 HTML 传给 `seokit_parse_seo`。从页面正文核对主实体、规格、问答和导航。现有 JSON-LD 用于检查类型、`@id` 和冲突，单独校验并记录已有问题。Markdown 或 HTML 草稿直接读取正文，发布 URL 只采用已确认的地址。抓取失败且没有可用草稿时，说明缺少的内容来源。
3. 按实际内容选择 `Organization` 与 `Product.manufacturer`、`Product`、`FAQPage`、`HowTo` 或 `BreadcrumbList`。多实体可以用 `@graph` 和稳定 `@id` 关联。确保发布页面能证实所标记内容，且厂址、证书、型号、参数和价格适用同一主体及条件。询盘型设备省略 `offers`。缺少的证据留在交付说明中。显式要求 HowTo 或明确存在 Schema.org 消费方时，可对真实可执行步骤使用 HowTo，并在校验时启用 `allowHowTo: true`。
4. 对最终序列化的原始 JSON 字符串调用 `seokit_validate_schema({ blocks: [json] })`，HowTo 按上一步添加选项。要求 `valid: true`、`blocksChecked: 1`、`nodesChecked > 0`。修正错误和有证据可修复的警告，每次修改后重新验证。记录其余警告及省略字段的原因。无法达到校验门槛时，仅交付诊断和待办清单。
5. 保存已校验的同一份 JSON 到 `drafts/<slug>-schema.jsonld`，回读确认。用户要求报告内嵌时，可将同一份 JSON 放在 `audits/` 下报告的 `json` 代码块中。回复交付路径、类型、已有标记的合并或替换建议及需要补充的证据。
