const BOT_NAMES = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "CCBot", "Bytespider", "Amazonbot",
];

type Rule = { directive: "allow" | "disallow"; path: string };
type Group = { userAgents: string[]; rules: Rule[] };

function parseGroups(source: string) {
  const groups: Group[] = [];
  const sitemaps: string[] = [];
  let group: Group | undefined;
  let startedRules = false;
  for (const line of source.split(/\r\n|\n|\r/)) {
    const match = /^\s*([\w-]+)\s*:\s*(.*?)\s*$/.exec(line.split("#", 1)[0]);
    if (!match) continue;
    const [, key, value] = match;
    const directive = key.toLowerCase();
    if (directive === "sitemap" && value) sitemaps.push(value);
    if (directive === "user-agent" && /^(?:\*|[a-z_-]+)$/i.test(value)) {
      if (!group || startedRules) {
        group = { userAgents: [], rules: [] };
        groups.push(group);
        startedRules = false;
      }
      group.userAgents.push(value.toLowerCase());
    }
    if (group && (directive === "allow" || directive === "disallow")) {
      startedRules = true;
      if (value.startsWith("/")) group.rules.push({ directive, path: value });
    }
  }
  return { groups, sitemaps };
}

function normalizePath(path: string): string {
  return encodeURI(path).replace(/%25(?=[0-9a-f]{2})/gi, "%").replace(/%[0-9a-f]{2}/gi, (encoded) => {
    const char = String.fromCharCode(Number.parseInt(encoded.slice(1), 16));
    return /^[a-z0-9._~-]$/i.test(char) ? char : encoded.toUpperCase();
  });
}

function matchesPath(pattern: string, path: string): boolean {
  const anchored = pattern.endsWith("$");
  const parts = (anchored ? pattern.slice(0, -1) : pattern).split("*");
  const prefix = parts.shift() ?? "";
  if (!path.startsWith(prefix)) return false;
  if (!parts.length) return !anchored || path === prefix;

  const suffix = anchored ? parts.pop() ?? "" : "";
  const end = path.length - suffix.length;
  if (end < prefix.length || !path.endsWith(suffix)) return false;
  let cursor = prefix.length;
  for (const part of parts) {
    if (!part) continue;
    const index = path.indexOf(part, cursor);
    if (index < 0 || index + part.length > end) return false;
    cursor = index + part.length;
  }
  return true;
}

export function analyzeRobots(source: string | null, target: URL, missing: boolean) {
  const testedPath = target.pathname + target.search;
  const path = normalizePath(testedPath);
  const { groups, sitemaps } = parseGroups(source ?? "");
  const prepared = groups.map((group) => ({
    userAgents: group.userAgents,
    rules: group.rules.map((rule) => {
      const pattern = normalizePath(rule.path);
      const length = pattern.replace(/%[0-9a-f]{2}/gi, "x").replace(/\*/g, "").replace(/\$$/, "").length;
      return { rule, pattern, length };
    }),
  }));

  const bots = BOT_NAMES.map((userAgent) => {
    const explicit = prepared.filter((group) => group.userAgents.includes(userAgent.toLowerCase()));
    const applicable = explicit.length ? explicit : prepared.filter((group) => group.userAgents.includes("*"));
    let best: (typeof prepared)[number]["rules"][number] | undefined;
    for (const group of applicable) {
      for (const candidate of group.rules) {
        if (best && (candidate.length < best.length ||
          (candidate.length === best.length && candidate.rule.directive === "disallow"))) continue;
        if (matchesPath(candidate.pattern, path)) best = candidate;
      }
    }
    return {
      userAgent,
      ruleSource: explicit.length ? "explicit" : applicable.length ? "wildcard" : "none",
      allowed: source === null && !missing ? null : best?.rule.directive !== "disallow",
      matchedRule: best?.rule ?? null,
    };
  });
  return { testedPath, bots, groups, sitemaps };
}
