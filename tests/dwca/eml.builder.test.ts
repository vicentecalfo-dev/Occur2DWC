import { describe, expect, it } from 'vitest';

import { EmlBuilder } from '../../src/dwca/EmlBuilder';

describe('EmlBuilder', () => {
  it('should generate minimal eml with defaults', () => {
    const builder = new EmlBuilder();

    const xml = builder.build({
      datasetTitle: undefined,
      datasetDescription: undefined,
      publisher: undefined,
    });

    expect(xml).toContain('<title>Dataset Occur2DWC</title>');
    expect(xml).toContain('<organizationName>Occur2DWC</organizationName>');
    expect(xml).toContain('<!-- Documento mínimo gerado automaticamente. -->');
  });

  it('should apply custom title description and publisher', () => {
    const builder = new EmlBuilder();

    const xml = builder.build({
      datasetTitle: 'Coleção Botânica Teste',
      datasetDescription: 'Descrição do dataset de teste.',
      publisher: 'JBRJ',
    });

    expect(xml).toContain('<title>Coleção Botânica Teste</title>');
    expect(xml).toContain('<organizationName>JBRJ</organizationName>');
    expect(xml).toContain('<para>Descrição do dataset de teste.</para>');
  });
});
