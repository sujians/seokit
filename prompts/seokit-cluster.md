---
description: Plan product keyword clusters for B2B manufacturing and export sites, import optional CSV data, and save YAML and Markdown
argument-hint: "<product_or_topic> [CSV file]"
---

Follow the registered `seo-keyword-cluster` skill and its references. The first argument is `${1:-not provided}`. Remaining arguments are `${@:2}`.

Call `seokit_load_profile({})` first. Use the applicable markets, product lines, certifications, and glossary. Continue in generic mode if the profile is missing or invalid. Ask for the topic if it is missing. A CSV path can be passed on the command line or supplied in the conversation. Quote topics and paths containing spaces individually. If the remaining arguments are part of the topic, join them to the first argument. Read and parse any supplied CSV before cluster research.

Group terms by buyer task and search evidence. Plan hubs, spokes, page types, target terms, priorities, and links. Follow the skill's slug rules and save the plan to `clusters/<keyword-slug>-clusters.yaml`. Generate `clusters/<keyword-slug>-clusters.md` from the same data. Verify both files and report their paths and the first pages to implement.
