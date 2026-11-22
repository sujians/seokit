---
description: 通过分轮访谈创建或补全当前项目的 SEO 档案
argument-hint: "[站点 URL 或项目背景]"
---

按已注册的 `profile` 技能执行。先读取该技能和它的 `references/profile-schema.yaml`，再确认当前项目是否已有 `profile/profile.yaml`。

用户提供的初始线索如下。${@:-无}

沿用已有档案和本轮对话中用户已确认的信息。用用户的语言分轮提问，每轮等待回复。首轮聚焦项目名、站点、目标市场和内容语言。随后根据项目类型收集公司与工厂资质、产品参数与材质、认证合规、供应与定制能力，以及买家画像、行业术语和禁用空话。对未掌握的信息允许跳过，用户也可以确认目前的最小档案并结束访谈。

收集完毕后，请用户确认拟写入的内容、证据出处和仍待补的关键信息。确认后将档案写入当前项目的 `profile/profile.yaml` 并调用 `seokit_load_profile` 校验。成功后报告保存路径和待补信息。若校验失败，根据错误定位修正格式，涉及事实变化时先向用户核实。

提醒用户将 `profile/.env` 加入当前项目的 `.gitignore`。DataForSEO 凭证放在进程环境或 `profile/.env`，不要写入 `profile/profile.yaml`。
