---
description: 体检 B2B 制造与外贸站的公开页面，并保存分优先级的 SEO/GEO 报告
argument-hint: "<url>"
---

按已注册的 `seo-audit` 技能执行，并读取它的三个参考文件。审计 URL 为 `${1:-未提供}`。先验证它是有效的公开 HTTP(S) URL，缺少或无效时请用户提供 URL。

先尝试调用 `seokit_load_profile({})` 获取适用的业务上下文。档案缺失、校验失败或属于其他项目时自动进入通用模式，继续审计。按工具执行流在 `codemode` 中调用 `seokit_fetch_page`，再把同次响应的最终 URL 和 HTML 传给 `seokit_parse_seo`，依次将原始 JSON-LD 块传给 `seokit_validate_schema`、将 HTML 传给 `seokit_score_geo`。完整工具链需要启用 Pi `codemode`（`pi --tools +codemode`）。无法取得适用输入或工具不可用时，记录原因并完成仍可执行的检查。

根据评分参考输出 P0 阻断项、P1 高收益项和 P2 优化项。用用户的语言将完整报告写入当前项目的 `audits/<domain>-<date>.md`，核对写入结果后回复报告路径、审计范围和最重要的发现。
