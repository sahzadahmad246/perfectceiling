export function parseDocumentSequence(
  documentNumber: string,
  prefix: string,
) {
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = documentNumber.trim().match(new RegExp(`^${escapedPrefix}-(\\d+)$`));

  if (!match) {
    return 0;
  }

  const parsed = Number.parseInt(match[1] ?? "", 10);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function getNextDocumentNumber(
  numbers: string[],
  prefix: string,
  padLength = 4,
) {
  const maxSequence = numbers.reduce((currentMax, number) => {
    return Math.max(currentMax, parseDocumentSequence(number, prefix));
  }, 0);

  return `${prefix}-${String(maxSequence + 1).padStart(padLength, "0")}`;
}