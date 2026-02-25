export interface BuildEmlInput {
  datasetTitle: string | undefined;
  datasetDescription: string | undefined;
  publisher: string | undefined;
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export class EmlBuilder {
  build(input: BuildEmlInput): string {
    const title = input.datasetTitle?.trim() || 'Dataset Occur2DWC';
    const description =
      input.datasetDescription?.trim() ||
      'Descrição mínima gerada automaticamente pelo Occur2DWC. Atualize este conteúdo antes de publicar o DwC-A.';
    const publisher = input.publisher?.trim() || 'Occur2DWC';

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<eml:eml xmlns:eml="eml://ecoinformatics.org/eml-2.1.1" packageId="occur2dwc.generated" system="occur2dwc">',
      '  <!-- Documento mínimo gerado automaticamente. -->',
      '  <!-- Recomenda-se completar metadados de contato, cobertura temporal e licença. -->',
      '  <dataset>',
      `    <title>${escapeXml(title)}</title>`,
      '    <creator>',
      `      <organizationName>${escapeXml(publisher)}</organizationName>`,
      '    </creator>',
      `    <pubDate>${new Date(0).toISOString().slice(0, 10)}</pubDate>`,
      '    <abstract>',
      `      <para>${escapeXml(description)}</para>`,
      '    </abstract>',
      '    <publisher>',
      `      <organizationName>${escapeXml(publisher)}</organizationName>`,
      '    </publisher>',
      '    <intellectualRights>',
      '      <para>Defina explicitamente os direitos de uso deste dataset.</para>',
      '    </intellectualRights>',
      '  </dataset>',
      '</eml:eml>',
      '',
    ].join('\n');
  }
}
