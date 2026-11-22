# 集群计划输出约定

## `.seokit/clusters.yaml`

用一个 YAML 文档保存 `schema_version: 1` 和 `clusters` 列表。每个集群写明 `id`、`topic`、`markets`（地区列表或 `null`）、`language`（语言标签或 `null`）、`profile_mode`（`profile` 或 `generic`）、`updated_at`、`sources`、`pages`、`links` 和 `open_questions`。少量示例字段如下，真实计划按素材补齐。

```yaml
schema_version: 1
clusters:
  - id: en-enclosures
    topic: Stainless steel enclosures
    markets: null
    language: en
    profile_mode: generic
    updated_at: '2026-01-15'
    sources:
      - id: seed
        type: user_seed
        reference: Stainless steel enclosures
    pages:
      - id: en-enclosures-hub
        role: hub
        title: Stainless Steel Enclosures
        primary_keyword: stainless steel enclosures
        secondary_keywords: []
        buyer_intent:
          category: procurement
          stage: BOFU
          task: 筛选产品族并准备询价
        page_type: category_procurement
        action: create
        path: /products/stainless-steel-enclosures/
        priority: P1
        priority_reason: 承接采购任务并为细分页提供入口
        grouping_basis: intent_hypothesis
        evidence_refs: [seed]
        verification_needed: ['[TODO: add company proof] 核对可公开的产品范围及询价入口']
      - id: en-enclosures-comparison
        role: spoke
        title: 304 vs 316 Stainless Steel Enclosures
        primary_keyword: 304 vs 316 stainless steel enclosure
        secondary_keywords: []
        buyer_intent:
          category: comparison
          stage: MOFU
          task: 根据工况选择材料方案
        page_type: comparison_guide
        action: create
        path: /resources/304-vs-316-stainless-steel-enclosures/
        priority: P2
        priority_reason: 依赖品类入口及可引用的材料资料
        grouping_basis: intent_hypothesis
        evidence_refs: [seed]
        verification_needed: [核对材料性能口径与适用工况]
    links:
      - from: en-enclosures-hub
        to: en-enclosures-comparison
        type: hub_to_spoke
        anchor: Compare 304 and 316 enclosure materials
        placement: 材料选项段落
      - from: en-enclosures-comparison
        to: en-enclosures-hub
        type: spoke_to_hub
        anchor: Explore stainless steel enclosure options
        placement: 选型建议后的产品入口
    open_questions: [确认目标市场和主要 SERP 页型]
```

- `id` 在对应集群或页面类型内全文件唯一，已存在的 ID 保持稳定。页型使用明确、可复用的名称，例如 `category_procurement`、`product_procurement`、`oem_capability`、`specification`、`process_guide`、`industry_solution`、`comparison_guide`。`buyer_intent.category` 对应 `procurement`、`engineering`、`application`、`comparison`。采购、工程和场景的 `stage` 分别为 `BOFU`、`MOFU-engineering`、`MOFU-application`，对比按主任务填 `MOFU` 或 `BOFU`。
- `path` 记录已核对的 URL、建议的站内路径或待确认时的 `null`。`action` 让读者区分已规划新页面和可复用的存量页面。`grouping_basis` 根据实际证据取 `serp_overlap`、`serp_observation` 或 `intent_hypothesis`。规划时记录必要资料和待验证上市条件。集群可按需附 `excluded_keywords`，列词与原因。
- `sources` 用 `id`、`type` 和 `reference` 标识来源。CSV 引用记录文件名和记录号，网页来源记录 URL，SERP 比较还应记录词对、市场、语言、设备、查询日期、结果来源和适用时的重合数。页面通过 `evidence_refs` 引用本集群来源。若输出词级指标，按词和市场保留来源及统计周期，未知值用 `null`，明确的 `0` 原样保留。
- 同语言同 URL 面向多个相近市场时，把地区列入同一个 `markets`；查询意图或页面职责确有区别时规划独立路径。计划尚无市场信息时可使用 `null` 并列为待验证项。

## `.seokit/clusters.md`

从校验后的完整 YAML 生成 Markdown。开头概括每个集群的主题、市场、语言、档案模式、CSV 覆盖与证据局限。按集群和优先级列出每个页面，包含建议路径或现有 URL、主要和辅助目标词、买家任务与意图阶段、建议页型、优先级及理由、所有计划中的出链目标。内链至少给出目标页面标题或路径；需要时补充锚文本与放置位置。最后列出首批实施顺序、上线依赖和待验证项。

## 更新与核对

1. 写前读取已有 YAML。首次运行创建文件。再次运行按同一主题及目标市场语言匹配既有集群并更新，保留其他集群和已确定的页面标识。清理因此失效的链接或明确替代目标。遇到现有 YAML 损坏、版本不明或匹配不明确时，保留原文件并指出需要处理的冲突。
2. 写前核对 YAML 结构与字段，验证 Hub 数量、页面 ID、关键词归属、URL、证据引用和链接端点。用 YAML 解析器检查语法（若使用 shell，沿用 Ruby/Node 等环境中提供的 YAML 解析器，无需安装工具；也可用 JSON 语法输出 YAML 兼容文档）。含冒号、井号或易被解释为其他类型的词用引号包裹。确认 Markdown 的页面和出链与同一份计划一致。
3. 先写 YAML，再写 Markdown。完成后读回两个文件，核对本次主题及保留的集群。Markdown 写入失败时从已保存的 YAML 重新生成并验证，仍未完成时说明哪个文件未更新。
