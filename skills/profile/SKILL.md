---
name: profile
description: Create, update, or validate a project's profile/profile.yaml for SEO and GEO work. Use it to capture target markets, buyer intent, terminology, and company evidence, especially for B2B manufacturing and export sites.
---

# SEO Project Profile

1. Read [profile-schema.yaml](references/profile-schema.yaml) for field definitions, types, and examples. The active project's profile is `profile/profile.yaml`. Check for an existing file and retain confirmed values. If the file cannot be parsed, identify the error and preserve its contents.
2. Interview the user in rounds and ask only for missing information in each round.
   - Start with the project name, website, target markets, content languages, and SEO goals.
   - Collect company and factory qualifications, product lines, technical specifications and tolerances, materials, certifications and scope, MOQ, samples, lead times, and OEM/ODM capabilities. Retain units, applicable models, and supply conditions.
   - Confirm buyer industries, roles, selection criteria, objections, search intent, preferred industry terms in each language, and phrases to avoid.
3. Map confirmed details to schema fields. Record public links or verifiable document names or IDs in the applicable `evidence` fields. Verify public industry and technical facts against authoritative sources. Use user-provided evidence for certificate numbers, covered products, and validity dates.
4. Before saving, ask the user to confirm the proposed values and review the open items. A minimal profile contains `schema_version: 1` and `project.name`. Omit unknown fields and write only confirmed numbers or booleans. Apply confirmed changes to an existing profile. Create `profile/`, save the YAML, call `seokit_load_profile` to validate it, and report the path and remaining gaps.

Add `profile/.env` to the current project's `.gitignore`. Keep DataForSEO credentials in the process environment or `profile/.env`.

Load the profile at the start of subsequent SEO/GEO work. Use the target market, buyer intent, and industry terminology. Where first-party proof is missing, use objective industry guidance or mark the relevant position `[TODO: add company proof]`.
