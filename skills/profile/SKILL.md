---
name: profile
description: Create, update, or validate a project's profile/profile.yaml for SEO and GEO work. Use it to capture target markets, buyer intent, terminology, and company evidence, especially for B2B manufacturing and export sites.
---

# SEO 项目档案

1. 读取本技能目录下的 [profile-schema.yaml](references/profile-schema.yaml)，以字段定义、类型和示例为准。档案保存在当前项目的 `profile/profile.yaml`。先检查已有档案，沿用用户已确认的信息。若已有档案无法解析，先定位错误并保留原文件内容。
2. 按主题分轮收集信息，每轮只追问本轮缺项。
   - 先确认项目名、站点、目标市场、内容语言和 SEO 目标。
   - 收集公司和工厂资质、产品线、技术参数与公差、材质、认证与适用范围，以及 MOQ、打样、交期和 OEM/ODM 能力。涉及规格时保留单位和适用型号，涉及交付时记录适用条件。
   - 核对买家所在行业、岗位、选型标准、采购疑虑、搜索意图，以及各语言的行业术语和拟禁用的空话。
3. 把用户确认的信息写入对应字段。有来源时将公开链接或可核验的文件编号、名称记入对应的 `evidence`。核对外部行业或技术事实时，查阅权威公开来源，并保留出处。证书编号、适用产品、有效期等以用户提供的资料为准。
4. 保存前请用户确认摘要，列出仍待确认的关键信息。最小档案只需 `schema_version: 1` 和 `project.name`，其余未知字段省略。数值和布尔值只写入已确认值。现有档案按确认的变更更新。创建 `profile/` 后写入 YAML，随后调用 `seokit_load_profile` 校验，并告知用户保存路径和剩余待补资料。

将 `profile/.env` 加入当前项目的 `.gitignore`。DataForSEO 凭证放在进程环境或 `profile/.env`，不要写入 `profile/profile.yaml`。

后续 SEO/GEO 工作先加载本档案，按目标市场、买家意图和行业术语开展工作。缺少公司证据时使用客观行业表述，或在需要第一方证明处标记 `[TODO: add company proof]`。
