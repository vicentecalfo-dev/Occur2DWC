import { CliError } from '../shared/errors/cli-error';
import { DWC_DYNAMIC_PROPERTIES_TERM, resolveDwCTerm, toDwCTermUri } from './constants';

export interface BuildMetaXmlInput {
  headerColumns: readonly string[];
  idField: string;
}

export interface MetaXmlBuildResult {
  xml: string;
  idIndex: number;
  warnings: string[];
}

function escapeXmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export class MetaXmlBuilder {
  build(input: BuildMetaXmlInput): MetaXmlBuildResult {
    if (input.headerColumns.length === 0) {
      throw new CliError('Não foi possível gerar meta.xml: cabeçalho vazio.', 2);
    }

    const idIndex = input.headerColumns.indexOf(input.idField);

    if (idIndex < 0) {
      throw new CliError(
        `Campo de ID "${input.idField}" não encontrado no cabeçalho do arquivo de entrada.`,
        2,
      );
    }

    const warnings: string[] = [];
    const fieldLines: string[] = [];

    input.headerColumns.forEach((columnName, index) => {
      const resolvedTerm = resolveDwCTerm(columnName);

      if (resolvedTerm) {
        fieldLines.push(
          `    <field index="${index}" term="${escapeXmlAttribute(toDwCTermUri(resolvedTerm))}"/>`,
        );
        return;
      }

      warnings.push(
        `Coluna "${columnName}" não reconhecida na whitelist DwC. Mapeando para dynamicProperties.`,
      );
      fieldLines.push(
        `    <field index="${index}" term="${escapeXmlAttribute(toDwCTermUri(DWC_DYNAMIC_PROPERTIES_TERM))}"/>`,
      );
    });

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<archive xmlns="http://rs.tdwg.org/dwc/text/">',
      '  <core encoding="UTF-8" linesTerminatedBy="\\n" fieldsTerminatedBy="\\t" fieldsEnclosedBy="&quot;" ignoreHeaderLines="1" rowType="http://rs.tdwg.org/dwc/terms/Occurrence">',
      '    <files>',
      '      <location>occurrence.txt</location>',
      '    </files>',
      `    <id index="${idIndex}"/>`,
      ...fieldLines,
      '  </core>',
      '</archive>',
      '',
    ].join('\n');

    return {
      xml,
      idIndex,
      warnings,
    };
  }
}
