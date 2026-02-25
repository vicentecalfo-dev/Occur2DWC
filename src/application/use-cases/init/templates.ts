export interface InitTemplateFile {
  readonly relativePath: string;
  readonly content: string;
}

export const INIT_TEMPLATE_FILES: readonly InitTemplateFile[] = [
  {
    relativePath: 'mapping.example.yml',
    content: `# Exemplo completo de mapeamento para o occur2dwc
# Este arquivo mostra como ligar colunas da sua planilha para termos Darwin Core.
#
# Como usar:
# occur2dwc convert --in ./examples/input.sample.csv --out ./examples/output.tsv --map ./mapping.example.yml

version: 1

# idStrategy controla como o occurrenceID sera preenchido:
# - preserve: usa occurrenceID vindo da origem
# - uuid: gera UUID novo em todas as linhas
# - hash: gera hash estavel por conteudo da linha
idStrategy: preserve

mappings:
  # Formato: coluna_origem: termo_destino_dwc
  id_registro: occurrenceID
  nome_cientifico: scientificName
  nome_sem_autor: scientificNameWithoutAuthorship
  familia: family
  genero: genus
  pais: country
  estado: stateProvince
  municipio: municipality
  localidade: locality
  dia: day
  mes: month
  ano: year
  coletor: recordedBy
  numero_coleta: recordNumber
  latitude: decimalLatitude
  longitude: decimalLongitude
  observacoes: occurrenceRemarks

# extras lista colunas que nao sao termos DwC e que devem ser preservadas.
# Elas podem ser usadas com --extras keep ou --extras dynamicProperties.
extras:
  - habitat
  - status_local
  - fonte_planilha
`,
  },
  {
    relativePath: 'profiles/custom-profile.json',
    content: `{
  "_comment": "Profile customizado para validar ou montar saidas simplificadas.",
  "name": "custom-occurrence",
  "_comment_columns": "columns define a ordem de colunas na saida.",
  "columns": [
    "occurrenceID",
    "scientificName",
    "country",
    "stateProvince",
    "municipality",
    "eventDate",
    "decimalLatitude",
    "decimalLongitude",
    "dynamicProperties"
  ],
  "_comment_required": "required define campos obrigatorios para validacao.",
  "required": [
    "occurrenceID",
    "scientificName",
    "decimalLatitude",
    "decimalLongitude"
  ],
  "_comment_rules": "rules e um exemplo de regras de negocio que voce pode expandir no projeto.",
  "rules": {
    "requireLatLonPair": true,
    "validateDayMonthYear": true,
    "allowFutureDates": false
  }
}
`,
  },
  {
    relativePath: 'examples/input.sample.csv',
    content: `id_registro,nome_cientifico,nome_sem_autor,familia,genero,pais,estado,municipio,localidade,dia,mes,ano,coletor,numero_coleta,latitude,longitude,habitat,status_local,fonte_planilha,observacoes
OCC-001,Euterpe edulis Mart.,Euterpe edulis,Arecaceae,Euterpe,Brasil,RJ,Rio de Janeiro,Parque Nacional da Tijuca,12,7,2021,Ana Silva,AS-102,-22.9535,-43.2819,Floresta ombrofila,dominante,levantamento_2021,Individuo adulto em sub-bosque
OCC-002,Schinus terebinthifolia Raddi,Schinus terebinthifolia,Anacardiaceae,Schinus,Brasil,RJ,Niteroi,Parque da Cidade,3,11,2020,Bruno Costa,BC-88,-22.9346,-43.1055,Borda de trilha,frequente,levantamento_2021,Frutos maduros
OCC-003,Inga vera Willd.,Inga vera,Fabaceae,Inga,Brasil,SP,Santos,Jardim Botanico Chico Mendes,18,2,2022,Carla Souza,CS-231,-23.9608,-46.3336,Area restaurada,rara,levantamento_2022,Floracao observada
OCC-004,Handroanthus chrysotrichus (Mart. ex DC.) Mattos,Handroanthus chrysotrichus,Bignoniaceae,Handroanthus,Brasil,MG,Belo Horizonte,Parque das Mangabeiras,25,9,2019,Diego Lima,DL-19,-19.9394,-43.9186,Campo antrópico,ocasional,levantamento_2019,Sem sinais de herbivoria
`,
  },
  {
    relativePath: 'examples/expected.simple.tsv',
    content: `occurrenceID\tscientificName\tscientificNameWithoutAuthorship\tfamily\tgenus\tcountry\tstateProvince\tmunicipality\tlocality\teventDate\tday\tmonth\tyear\tcollectionCode\tcatalogNumber\trecordedBy\trecordNumber\tdecimalLatitude\tdecimalLongitude\tidentifiedBy\tdateIdentified\toccurrenceRemarks
OCC-001\tEuterpe edulis Mart.\tEuterpe edulis\tArecaceae\tEuterpe\tBrasil\tRJ\tRio de Janeiro\tParque Nacional da Tijuca\t\t12\t7\t2021\t\t\tAna Silva\tAS-102\t-22.9535\t-43.2819\t\t\tIndividuo adulto em sub-bosque
OCC-002\tSchinus terebinthifolia Raddi\tSchinus terebinthifolia\tAnacardiaceae\tSchinus\tBrasil\tRJ\tNiteroi\tParque da Cidade\t\t3\t11\t2020\t\t\tBruno Costa\tBC-88\t-22.9346\t-43.1055\t\t\tFrutos maduros
`,
  },
  {
    relativePath: 'examples/README.md',
    content: `# Exemplos de uso rapido

Este diretorio contem um CSV de exemplo e uma saida esperada para comparacao.

## 1) Converter

\`\`\`bash
occur2dwc convert \\
  --in ./examples/input.sample.csv \\
  --out ./examples/output.simple.tsv \\
  --map ./mapping.example.yml \\
  --derive-eventdate \\
  --report ./examples/convert.report.json
\`\`\`

## 2) Validar

\`\`\`bash
occur2dwc validate \\
  --in ./examples/output.simple.tsv \\
  --report ./examples/validate.report.json \\
  --strict
\`\`\`

## 3) Empacotar DwC-A

\`\`\`bash
occur2dwc pack \\
  --in ./examples/output.simple.tsv \\
  --out ./examples/output.dwca.zip \\
  --eml ./eml.template.xml
\`\`\`

## Dica

Use \`./examples/expected.simple.tsv\` como referencia para revisar colunas, delimitador e ordem esperada.
`,
  },
  {
    relativePath: 'eml.template.xml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<!-- Template minimo de EML para uso com occur2dwc pack -->
<eml:eml xmlns:eml="eml://ecoinformatics.org/eml-2.1.1" packageId="occur2dwc.dataset.exemplo" system="occur2dwc">
  <dataset>
    <!-- Titulo publico do dataset -->
    <title>Meu Dataset de Ocorrencias</title>
    <!-- Descricao curta e objetiva -->
    <abstract>
      <para>Descreva aqui escopo, origem dos dados e periodo de coleta.</para>
    </abstract>
    <!-- Publicador/instituicao responsavel -->
    <publisher>
      <organizationName>Instituicao Responsavel</organizationName>
    </publisher>
    <!-- Pessoa de contato -->
    <contact>
      <individualName>
        <givenName>Nome</givenName>
        <surName>Sobrenome</surName>
      </individualName>
      <electronicMailAddress>email@instituicao.br</electronicMailAddress>
    </contact>
  </dataset>
</eml:eml>
`,
  },
  {
    relativePath: 'README.occur2dwc.md',
    content: `# Projeto inicializado com occur2dwc

Este diretorio foi preparado para acelerar seu fluxo de publicacao em Darwin Core.

## Arquivos criados

- \`mapping.example.yml\`: modelo de mapeamento entre colunas da origem e termos DwC.
- \`profiles/custom-profile.json\`: base para perfis customizados.
- \`examples/\`: dados de exemplo para testar convert, validate e pack.
- \`eml.template.xml\`: template EML para metadados do dataset.

## Proximo passo recomendado

1. Ajuste \`mapping.example.yml\` para seus nomes de coluna reais.
2. Rode \`occur2dwc convert\` com os exemplos.
3. Rode \`occur2dwc validate --report\`.
4. Gere o archive final com \`occur2dwc pack\`.
`,
  },
];
