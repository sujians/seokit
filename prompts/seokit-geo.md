---
description: 评估 B2B 制造站的 AI 爬虫策略和页面可引用性，生成 GEO 报告与 llms.txt
argument-hint: "[url]"
---

按已注册的 `seo-geo` 技能执行，并读取 `references/llms-txt-and-entities.md`。评估 URL 为 `${1:-未提供}`。先尝试调用 `seokit_load_profile({})` 读取 `profile/profile.yaml`。未提供 URL 时使用适用档案中的 `project.website`。缺少有效目标时请用户提供公开 HTTP(S) URL。

按参考中的工具执行流抓取目标页，调用 `seokit_check_robots` 检查最终 URL 的有效规则，并将抓取到的 HTML 传给 `seokit_score_geo`。完整工具链使用 Pi `codemode`（`pi --tools +codemode`）。记录无法验证的检查项，并继续执行其余可用检查。

将站内优化清单、站外实体核查和复测条件写入 `audits/<slug>-geo.md`。用适用档案与已验证的公开页面生成 `drafts/llms.txt`。读回核对后回复交付路径、优先改动和仍缺的资料。
