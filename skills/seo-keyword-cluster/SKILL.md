---
name: seo-keyword-cluster
description: Plan keyword clusters and hub-and-spoke page architecture for B2B manufacturing, industrial products, and export websites. Import a supplied keyword CSV, map buyer intent to pages, and save a prioritized plan and Markdown summary under clusters/.
---

# B2B 制造与外贸站专题集群规划

1. 先尝试 `seokit_load_profile({})`。按 [研究与导入](references/research-and-import.md) 提取与主题相关的产品线、目标市场、内容语言、买家角色、认证范围及术语。档案缺失、校验失败或工具不可用时进入通用模式。优先用用户本轮确认的信息，缺少企业证据时记录 `[TODO: add company proof]`。
2. 用户提供 CSV 时，先用 `seokit_read_keyword_csv` 读取解析，再扩展候选词。按 [DataForSEO 使用方法](references/research-and-import.md#可选-dataforseo-数据) 检查 DataForSEO 是否可用，可用时优先获取候选词的目标市场搜索量与代表词的 Google 自然排名，缺失部分用公开搜索、网页抓取或已导入的 CSV 补充。按产品、采购任务与市场语言分组，结合搜索结果与已有页面判断哪些词应共用页面、哪些值得独立建页。对缺少可比 SERP 的分组标记为待验证。
3. 用 [B2B 买家意图矩阵](references/buyer-intent-matrix.md) 分配目标词、采购任务、建议页型与优先级。先明确产品或品类 Hub 的职责，再为规格工艺、行业应用、选型对比或独立采购任务安排 Spoke。核对同一市场语言中的存量 URL 和关键词归属，优先复用满足需求的页面。
4. 按 [Hub-Spoke 内链规则](references/hub-spoke-links.md) 规划双向入口、相关内容与询盘路径，检查孤立页、重复目标词、页面职责和发布依赖。
5. 按 [输出约定](references/plan-output.md) 生成安全专题 slug，读取并更新该专题的 `clusters/<keyword-slug>-clusters.yaml`，再从同一份规划生成 `clusters/<keyword-slug>-clusters.md`。保留同专题其他市场语言的集群及其他专题文件。写后核对两份文件与内链指向，向用户返回路径、首批优先页及待验证项。
