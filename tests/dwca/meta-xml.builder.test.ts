import { describe, expect, it } from 'vitest';

import { MetaXmlBuilder } from '../../src/dwca/MetaXmlBuilder';

describe('MetaXmlBuilder', () => {
  it('should build meta.xml with correct id index', () => {
    const builder = new MetaXmlBuilder();

    const result = builder.build({
      headerColumns: ['scientificName', 'occurrenceID', 'decimalLatitude', 'extraColumn'],
      idField: 'occurrenceID',
    });

    expect(result.idIndex).toBe(1);
    expect(result.warnings).toHaveLength(1);
    expect(result.xml).toContain('<location>occurrence.txt</location>');
    expect(result.xml).toContain('<id index="1"/>');
  });

  it('should match deterministic snapshot', () => {
    const builder = new MetaXmlBuilder();

    const result = builder.build({
      headerColumns: ['occurrenceID', 'scientificName', 'decimalLatitude', 'decimalLongitude'],
      idField: 'occurrenceID',
    });

    expect(result.xml).toMatchSnapshot();
  });

  it('should fail when header is empty', () => {
    const builder = new MetaXmlBuilder();

    expect(() =>
      builder.build({
        headerColumns: [],
        idField: 'occurrenceID',
      }),
    ).toThrow('cabeçalho vazio');
  });

  it('should fail when id field is missing', () => {
    const builder = new MetaXmlBuilder();

    expect(() =>
      builder.build({
        headerColumns: ['scientificName'],
        idField: 'occurrenceID',
      }),
    ).toThrow('Campo de ID');
  });
});
