function toNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return parsed;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function deriveEventDate(
  day: string | undefined,
  month: string | undefined,
  year: string | undefined,
): string | undefined {
  const parsedDay = toNumber(day);
  const parsedMonth = toNumber(month);
  const parsedYear = toNumber(year);

  if (!parsedDay || !parsedMonth || !parsedYear) {
    return undefined;
  }

  if (parsedMonth < 1 || parsedMonth > 12 || parsedDay < 1 || parsedDay > 31) {
    return undefined;
  }

  return `${String(parsedYear).padStart(4, '0')}-${pad(parsedMonth)}-${pad(parsedDay)}`;
}
