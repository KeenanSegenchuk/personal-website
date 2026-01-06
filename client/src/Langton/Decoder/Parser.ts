type SectionMap = Record<string, string>;

export function parseSections(
  lexicon: string,
  headers: readonly string[]
): SectionMap {
  const result: SectionMap = {};

  // Build regex like: ^(Directions:|Actions:|Resources:)
  const headerRegex = new RegExp(
    `^(${headers.map(h => h.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})`,
    "m"
  );

  const parts = lexicon.split(headerRegex).filter(Boolean);

  for (let i = 0; i < parts.length; i += 2) {
    const header = parts[i].trim();
    const body = parts[i + 1]?.trim() ?? "";
    result[header] = body;
  }

  return result;
}