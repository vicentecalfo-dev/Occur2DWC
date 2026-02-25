import { describe, expect, it } from 'vitest';

import {
  formatDelimitedLine,
  parseDelimitedLine,
} from '../../src/application/services/convert/delimited-text';
import { resolveInputDelimiterFromOption } from '../../src/application/services/convert/delimiters';

describe('delimited-text helpers', () => {
  it('should parse a comma line with escaped quotes', () => {
    const parsed = parseDelimitedLine('1,"A ""quoted"" value",x', ',');

    expect(parsed).toEqual(['1', 'A "quoted" value', 'x']);
  });

  it('should format values with quoting when needed', () => {
    const formatted = formatDelimitedLine(['1', 'A, B', 'Text "quoted"'], ',');

    expect(formatted).toBe('1,"A, B","Text ""quoted"""');
  });

  it('should preserve trailing empty field by quoting it', () => {
    const formatted = formatDelimitedLine(['id-1', ''], '\t');
    const parsed = parseDelimitedLine(formatted, '\t');

    expect(formatted).toBe('id-1\t""');
    expect(parsed).toEqual(['id-1', '']);
  });

  it('should detect delimiter automatically from header', () => {
    expect(resolveInputDelimiterFromOption('auto', 'a\tb\tc')).toBe('\t');
    expect(resolveInputDelimiterFromOption('auto', 'a;b;c')).toBe(';');
    expect(resolveInputDelimiterFromOption('auto', 'a,b,c')).toBe(',');
  });
});
