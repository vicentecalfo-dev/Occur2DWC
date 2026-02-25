import type { InputDelimiterOption, OutputDelimiterOption } from './types';

export function resolveInputDelimiterFromOption(
  option: InputDelimiterOption,
  headerLine: string,
): '\t' | ',' | ';' {
  if (option === 'auto') {
    if (headerLine.includes('\t')) {
      return '\t';
    }

    if (headerLine.includes(';')) {
      return ';';
    }

    return ',';
  }

  if (option === 'tab') {
    return '\t';
  }

  if (option === 'semicolon') {
    return ';';
  }

  return ',';
}

export function resolveOutputDelimiterFromOption(option: OutputDelimiterOption): '\t' | ',' {
  if (option === 'tab') {
    return '\t';
  }

  return ',';
}
