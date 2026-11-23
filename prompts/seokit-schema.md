---
description: 为 B2B 制造业公开页面或本地草稿生成并校验 Schema.org JSON-LD
argument-hint: "<url_or_draft> [draft_publish_url]"
---

执行已注册的 `seo-schema` 技能，并读取 `references/b2b-schema-templates.md`。目标为「${1:-未提供}」，草稿发布 URL 为「${2:-未提供}」，其余参数为「${@:3}」。文件路径含空格时用引号。缺少目标、存在额外参数，或给公开页面另外指定发布 URL 时，说明用法并请用户补正。

先调用 `seokit_load_profile({})` 读取 `profile/profile.yaml`。公开页面按参考中的流程用 `seokit_fetch_page` 与 `seokit_parse_seo` 串联取证，使用 Pi `codemode`（`pi --tools +codemode`）。本地 Markdown 或 HTML 草稿直接读取。根据可核实的页面内容和适用档案选择模板。询盘型设备省略价格与 `offers`。

对最终 JSON 调用 `seokit_validate_schema`，达到技能规定的门槛后才保存到 `drafts/<slug>-schema.jsonld`。用户要求报告内嵌时，使用 `audits/` 下报告的可复制 JSON 代码块。回读核对后给出交付路径、类型和待补证据。
