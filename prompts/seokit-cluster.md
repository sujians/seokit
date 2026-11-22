---
description: 为 B2B 制造与外贸站规划产品专题集群，可导入 CSV 词表并保存 YAML 和 Markdown
argument-hint: "<product_or_topic> [CSV 文件]"
---

按已注册的 `seo-keyword-cluster` 技能执行，并读取其参考文件。命令首个参数为 `${1:-未提供}`，其余参数为 `${@:2}`。

先调用 `seokit_load_profile({})`，使用适用的目标市场、产品线、认证和术语表。档案缺失或无效时自动按通用模式继续。主题缺失时，请用户补充主题。可在命令中追加 CSV 路径，也可在对话中明确提供。主题和路径含空格时可各自加引号。若余下参数只是主题内容，和首个参数合并。提供 CSV 路径时先读取解析，再开展集群研究。

按买家任务和搜索证据分组，规划 Hub、Spoke、推荐页型、目标词、优先级和内链。将结构化结果保存到 `.seokit/clusters.yaml`，并按同一份数据生成 `.seokit/clusters.md`。核对文件后返回两份路径与首批实施页。
