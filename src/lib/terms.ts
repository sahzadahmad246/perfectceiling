export function parseTerms(value: string | null | undefined) {
  return (
    value
      ?.split("\n")
      .map((line) => line.trim())
      .filter(Boolean) ?? []
  );
}

export function serializeTerms(lines: string[]) {
  return lines.join("\n");
}