function levenshteinDistance(source: string, target: string): number {
  if (source === target) {
    return 0;
  }

  if (source.length === 0) {
    return target.length;
  }

  if (target.length === 0) {
    return source.length;
  }

  const previousRow: number[] = Array.from({ length: target.length + 1 }, (_, index) => index);
  const currentRow: number[] = new Array(target.length + 1).fill(0);

  for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex += 1) {
    currentRow[0] = sourceIndex;

    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      const substitutionCost = source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1;
      const deletion = (previousRow[targetIndex] ?? Number.POSITIVE_INFINITY) + 1;
      const insertion = (currentRow[targetIndex - 1] ?? Number.POSITIVE_INFINITY) + 1;
      const substitution =
        (previousRow[targetIndex - 1] ?? Number.POSITIVE_INFINITY) + substitutionCost;

      currentRow[targetIndex] = Math.min(deletion, insertion, substitution);
    }

    for (let index = 0; index <= target.length; index += 1) {
      previousRow[index] = currentRow[index] ?? 0;
    }
  }

  return previousRow[target.length] ?? target.length;
}

export function suggestClosestValue(
  value: string,
  candidates: readonly string[],
  maxDistance = 3,
): string | undefined {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === '') {
    return undefined;
  }

  let bestMatch: string | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const distance = levenshteinDistance(normalizedValue, candidate.toLowerCase());

    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = candidate;
    }
  }

  if (bestDistance <= maxDistance) {
    return bestMatch;
  }

  return undefined;
}
