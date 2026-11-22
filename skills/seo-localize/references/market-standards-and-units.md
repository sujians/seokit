# B2B 市场标准与单位对照表

| 目标市场 | 参数和格式 | 采购表达示例（以当次检索为准） | 合规核查入口 |
|---|---|---|---|
| 美国（如 `en-US`） | 遇到长度、质量和温度时自动补充 `in`（inch）、`lb`（pounds）和 `°F`，保留原单位和原值。数字示例 `1,234.56`，日期可拼写月份以避免歧义。 | 按搜索证据选用 `spec sheet`、`installation clearance`、`request a quote` 等买家用语。 | 按用途核对 UL 或 ETL 标志及适用的 NRTL 列名、NSF/ANSI 标准或卫生认证、FDA 监管要求（例如食品接触材料的授权和使用条件）、适用的 ANSI 或经 ANSI 批准的标准。 [OSHA NRTL 名单](https://www.osha.gov/nationally-recognized-testing-laboratory-program/current-list-of-nrtls) · [Intertek ETL](https://www.intertek.com/marks/etl/) · [NSF 商用食品设备认证](https://www.nsf.org/food-beverage/commercial-food-equipment/food-equipment-certification) · [FDA 食品接触物质](https://www.fda.gov/food/food-ingredients-packaging/food-contact-substances-fcs) · [ANSI 标准说明](https://ansi.org/standards-faqs) |
| 欧盟／德国（如 `de-DE`） | 优先显示 `mm`、`kg`、`°C` 等公制读数。原稿用其他单位时并列保留原规格。德语数字示例 `1.234,56`，日期示例 `31.12.2026`。 | 按搜索证据选用 `technisches Datenblatt`、`Einbaumaße`、`Angebot anfragen`，称呼统一。 | 按产品范围突出相关的 CE 标志及欧盟符合性声明、RoHS 电气电子设备有害物质限制、REACH 下的物质义务和适用的 EN 标准及版次。标明 EN 标准是否在有关欧盟法规下协调并已公布引用。 [欧盟 CE 标志](https://europa.eu/youreurope/business/product-rules-compliance/general-product-compliance/ce-marking/index_en.htm) · [欧委会 RoHS](https://environment.ec.europa.eu/topics/waste-and-recycling/rohs-directive_en) · [EUR-Lex REACH](https://eur-lex.europa.eu/legal-content/EN/LSU/?uri=CELEX%3A32006R1907) · [欧盟协调标准](https://single-market-economy.ec.europa.eu/single-market/goods/european-standards/harmonised-standards_en) |
| 其他市场 | 核实当地行业单位、数字分隔符、日期、币种标记及行文方向。原价和原币种原样保留，可调整展示格式。 | 以当地行业检索证据确定用语、语气和询盘方式。 | 到当地监管机构或标准发布方核对用途、地区、适用条款和生效日期。 |

保留源稿已核实的市场资质及其原适用范围。美国列名、FDA 授权、CE 标志、RoHS/REACH 声明和 EN 标准分别按其性质描述。禁止跨市场套换认证、将部件资质扩大到整机，或凭标准名称写成产品已认证。只有在明确适用且第一方证据匹配时才能加入产品合规陈述。证据不足时在核查摘要注明待确认的型号、市场或文件。

## 换算和参数保真

| 量 | 公制 → 美国常用单位 | 美国常用单位 → 公制 |
|---|---|---|
| 长度或长度公差 | in = mm ÷ 25.4 | mm = in × 25.4 |
| 质量 | lb = kg ÷ 0.45359237 | kg = lb × 0.45359237 |
| 温度读数 | °F = °C × 9/5 + 32 | °C = (°F − 32) × 5/9 |
| 温差或温度公差 | Δ°F = Δ°C × 9/5 | Δ°C = Δ°F × 5/9 |

- 每个维度、范围端点及公差单独计算，保留顺序、符号和范围含义。新增舍入值标为约值并与原规格并列，例如 `635 mm (25 in)`、`10 kg (approx. 22 lb)`。辅助读数用于选型，验收以原规格为准。保留原始有效位数，避免舍入掩盖公差或让两个端点显示成同一值。
- 单位或变量含义不明时保留原文并标注待核。螺纹、板材 gauge、管径、材料牌号和电气额定值按原标准和型号保留。名义规格只能依据有出处的对照表解释。相近的牌号、供电条件或器件规格不能视为等价。
- 按 locale 调整正文数值的分隔符。型号、图纸号、认证号、版次和日期标识中的字符保持原样。存在歧义的日期和币种保留并标注待核。 [NIST 长度与质量换算](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9) · [NIST 温度换算](https://www.nist.gov/pml/owm/si-units-temperature)
