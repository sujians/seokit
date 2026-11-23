---
description: Create or complete the current project's SEO profile through a staged interview
argument-hint: "[site URL or project context]"
---

Follow the registered `profile` skill. Read the skill and its `references/profile-schema.yaml`, then check whether `profile/profile.yaml` already exists.

Initial project context from the user follows. ${@:-None supplied}

Reuse relevant facts already confirmed in the current conversation or profile. Ask questions in the user's language in rounds and wait for a reply after each round. Begin with the project name, website, target markets, and content languages. Continue with company and factory qualifications, product specifications and materials, certifications and compliance, supply and customization, buyer personas, industry terms, and phrases to avoid. Allow the user to skip unknowns or end the interview after confirming a minimal profile.

Ask the user to confirm the proposed values, sources, and outstanding information. After confirmation, write `profile/profile.yaml` and validate with `seokit_load_profile`. Report the path and any remaining gaps. If validation fails, fix the indicated format issues and confirm any factual changes with the user.

Remind the user to add `profile/.env` to the current project's `.gitignore`. Keep DataForSEO credentials in the process environment or `profile/.env`.
