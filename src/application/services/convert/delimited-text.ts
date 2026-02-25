export function parseDelimitedLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      const nextCharacter = line[index + 1];

      if (insideQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
        continue;
      }

      insideQuotes = !insideQuotes;
      continue;
    }

    if (!insideQuotes && character === delimiter) {
      values.push(current);
      current = '';
      continue;
    }

    current += character;
  }

  values.push(current);

  return values;
}

export function formatDelimitedLine(values: readonly string[], delimiter: string): string {
  return values
    .map((value, index) => {
      if (value === '' && index === values.length - 1) {
        return '""';
      }

      const shouldQuote =
        value.includes(delimiter) ||
        value.includes('"') ||
        value.includes('\n') ||
        value.includes('\r');

      if (!shouldQuote) {
        return value;
      }

      return `"${value.replaceAll('"', '""')}"`;
    })
    .join(delimiter);
}
