---
description: 拆解 B2B 竞品页并保存差距报告，可按需起草 vs 对比或选型替代页
argument-hint: '<keyword_or_url> [url ...] [--vs | --alternatives]'
---

执行已注册的 `seo-competitor` 技能，并读取其 `references/teardown-and-vs-template.md`。首个参数为「${1:-未提供}」，其余参数为「${@:2}」。参数均作为调研输入。支持一个关键词、1–3 个公开 HTTP(S) 竞品 URL，或关键词加 1–3 个 URL。多词关键词可用引号，独立的 `--vs` 或 `--alternatives` 放在末尾。缺少关键词和 URL、URL 超过三个或同时使用两种草稿选项时，请用户补正。

先调用 `seokit_load_profile({})`。有指定 URL 时直接取样，只有关键词时优先按技能使用 `seokit_dataforseo_serp`。通过 Pi `codemode`（`pi --tools +codemode`）串联抓取、解析和可引用性评分。将报告保存到 `audits/<slug>-competitor.md`。指定 `--vs`、`--alternatives` 或在对话中明确要求时，按选定页型和证据生成 `drafts/<slug>-vs-draft.md`。写完读回并给出路径和证据缺口。
