# Occur2DWC

Ferramenta de linha de comando para conversao, validacao e geracao de pacotes Darwin Core (Simple Darwin Core e Darwin Core Archive - DwC-A).

## 1. Titulo

### Occur2DWC

CLI para padronizacao de dados de ocorrencia biologica no ecossistema Darwin Core, incluindo mapeamento, validacao e empacotamento para publicacao.

## 2. Visao Geral

Projetos de biodiversidade frequentemente lidam com planilhas heterogeneas, nomes de colunas inconsistentes e ausencia de controles minimos de qualidade antes da publicacao. O Occur2DWC resolve esse problema ao oferecer um fluxo operacional unico para transformar dados tabulares em estruturas compativeis com Darwin Core.

Com a ferramenta, e possivel:

- converter CSV/TSV para Simple Darwin Core;
- validar campos obrigatorios e consistencia basica de coordenadas e data;
- gerar relatorios tecnicos em JSON para auditoria;
- empacotar datasets em Darwin Core Archive (DwC-A) com `occurrence.txt`, `meta.xml` e `eml.xml`.

Principais comandos:

- `convert`: converte e aplica regras de transformacao;
- `validate`: valida arquivos sem transformar o dataset;
- `pack`: gera o pacote DwC-A (`.zip`);
- `init`: inicializa estrutura recomendada de projeto.

## 3. Conceitos Fundamentais

### Darwin Core

Darwin Core (DwC) e um padrao de termos para troca de dados de biodiversidade, com foco em ocorrencias, taxonomia, localizacao, coleta e identificacao.

### Simple Darwin Core

Simple DwC representa os dados em um unico arquivo tabular (normalmente CSV ou TSV), no qual cada linha descreve uma ocorrencia e cada coluna corresponde a um termo DwC.

### Darwin Core Archive (DwC-A)

DwC-A e um pacote zipado para distribuicao de dados. No caso de ocorrencia simples, inclui tipicamente:

- `occurrence.txt`;
- `meta.xml` (metadados estruturais do arquivo);
- `eml.xml` (metadados descritivos do dataset).

### dynamicProperties

`dynamicProperties` e um termo DwC usado para armazenar informacao adicional em formato JSON quando a coluna original nao corresponde a termos DwC mapeados explicitamente.

### Presets

Presets sao mapeamentos internos predefinidos para formatos de entrada conhecidos. O projeto inclui o preset `cncflora-proflora`.

### Profiles

Profiles definem a estrutura alvo de colunas e os campos obrigatorios durante conversao/validacao. No Occur2DWC, os perfis disponiveis sao:

- `minimal-occurrence`;
- `occurrence`;
- `cncflora-occurrence`.

## 4. Instalacao

### Instalacao global

```bash
npm install -g occur2dwc
```

### Uso via npx

```bash
npx occur2dwc --help
```

### Uso local em desenvolvimento

Passo a passo:

1. Clonar o repositorio.
2. Instalar dependencias.
3. Compilar o projeto.
4. Executar a CLI gerada.

```bash
git clone https://github.com/Occur2DWC/occur2dwc.git
cd occur2dwc
npm install
npm run build
node dist/cli.js --help
```

Execucao em desenvolvimento (sem build final):

```bash
npm run dev
```

Requisito de ambiente:

- Node.js `>= 20`.

## 5. Estrutura Geral de Uso

Fluxo recomendado:

1. `convert`
2. `validate`
3. `pack`

### Etapa 1: Conversao (`convert`)

Converte o arquivo de origem para Simple DwC, aplica mapeamento de colunas, trata campos extras e opcionalmente deriva `eventDate`.

### Etapa 2: Validacao (`validate`)

Valida o resultado para identificar erros estruturais e semanticos antes da publicacao. Pode gerar relatorio JSON para rastreabilidade.

### Etapa 3: Empacotamento (`pack`)

Gera um arquivo `.zip` no formato DwC-A contendo dados e metadados estruturais (`meta.xml`) e descritivos (`eml.xml`).

## 6. Comando `convert`

### O que faz

Transforma um CSV/TSV de entrada em um arquivo Simple DwC, com suporte a:

- mapeamento por arquivo (`--map`);
- preset interno (`--preset`);
- inferencia por cabecalho;
- validacao por perfil;
- controle de colunas nao mapeadas (`--extras`);
- relatorio tecnico em JSON (`--report`).

### Quando usar

Use `convert` quando o dataset de origem ainda nao esta no padrao DwC, ou quando precisa padronizar delimitador, nomes de campo e estrutura de saida.

### Opcoes principais

| Opcao | Descricao tecnica |
| --- | --- |
| `--in <path>` | Arquivo de entrada (opcional; se ausente, le de `stdin`). |
| `--out <path>` | Arquivo de saida (obrigatorio). |
| `--map <path>` | Arquivo YAML/JSON com `version: 1` e bloco `mappings`. |
| `--preset <auto|cncflora-proflora|none>` | Preset interno de mapeamento. Padrao: `auto`. |
| `--profile <minimal-occurrence|occurrence|cncflora-occurrence>` | Define colunas alvo e campos obrigatorios. Padrao: `occurrence`. |
| `--derive-eventdate` | Deriva `eventDate` (ISO-8601) a partir de `day/month/year` quando `eventDate` estiver vazio. |
| `--extras <keep|drop|dynamicProperties>` | Define estrategia para colunas nao mapeadas. Padrao: `dynamicProperties`. |
| `--strict` | Retorna erro (codigo 1) se houver qualquer erro de validacao na conversao. |
| `--report <path>` | Salva relatorio JSON da conversao. |
| `--input-delimiter <auto|comma|tab|semicolon>` | Delimitador da entrada. Padrao: `auto`. |
| `--output-delimiter <tab|comma>` | Delimitador da saida. Padrao: `tab`. |

Opcoes adicionais relevantes:

- `--max-errors <n>`: limita o total de erros armazenados no relatorio (padrao `1000`);
- `--id-strategy <preserve|uuid|hash>`: estrategia para `occurrenceID`;
- `--encoding <utf8|latin1>`: codificacao de entrada/saida;
- `--normalize-html-entities`: decodifica entidades HTML em campos de texto;
- `--log-format <text|json>`: formato de log.

### Como funciona o mapping

O processo de mapeamento segue esta ordem:

1. Se `--map` for informado, o arquivo de mapeamento do usuario e aplicado.
2. Se nao houver `--map`, a CLI tenta aplicar preset interno (dependendo de `--preset` e do cabecalho).
3. Colunas ainda nao mapeadas podem ser inferidas por normalizacao do nome da coluna para termos DwC conhecidos.
4. Colunas remanescentes sao tratadas por `--extras`.

Exemplo de mapeamento (`mapping.yml`):

```yaml
version: 1
idStrategy: preserve
mappings:
  id_registro: occurrenceID
  nome_cientifico: scientificName
  latitude: decimalLatitude
  longitude: decimalLongitude
extras:
  - observacoes_internas
  - codigo_planilha
```

### Como funciona o preset `cncflora-proflora`

O preset interno `cncflora-proflora` pode ser:

- aplicado automaticamente quando `--preset auto` e o cabecalho indica layout compativel;
- forcado com `--preset cncflora-proflora`;
- desativado com `--preset none`.

### Como funciona `--extras`

O comportamento de colunas nao mapeadas depende do modo selecionado:

- `keep`: mantem como colunas adicionais na saida;
- `drop`: remove completamente;
- `dynamicProperties`: agrega como JSON no campo `dynamicProperties`.

### Exemplos simples

Conversao basica:

```bash
occur2dwc convert \
  --in ./dados/origem.csv \
  --out ./saida/occurrence.tsv
```

Conversao com mapeamento e relatorio:

```bash
occur2dwc convert \
  --in ./dados/origem.csv \
  --out ./saida/occurrence.tsv \
  --map ./mapping.yml \
  --report ./saida/convert.report.json
```

### Exemplo avancado

```bash
occur2dwc convert \
  --in ./dados/proflora.csv \
  --out ./saida/occurrence.csv \
  --preset cncflora-proflora \
  --profile cncflora-occurrence \
  --input-delimiter semicolon \
  --output-delimiter comma \
  --derive-eventdate \
  --extras dynamicProperties \
  --id-strategy hash \
  --max-errors 5000 \
  --strict \
  --report ./saida/convert.report.json
```

## 7. Tratamento de Colunas Nao Mapeadas (`--extras`)

### Modo `keep`

Mantem as colunas nao mapeadas no arquivo final. Recomendado para diagnostico de migracao e auditoria comparativa.

### Modo `drop`

Descarta colunas nao mapeadas. Recomendado quando a politica institucional exige saida estritamente aderente ao perfil alvo.

### Modo `dynamicProperties` (padrao)

Move colunas nao mapeadas para um JSON em `dynamicProperties`. Recomendado para preservar contexto sem expandir a estrutura de colunas.

Exemplo de valor gerado em `dynamicProperties`:

```json
{"codigo_planilha":"LTP-2024-09","habitat":"Floresta ombrofila","status_local":"rara"}
```

Observacoes tecnicas:

- chaves sao ordenadas alfabeticamente para estabilidade de output;
- campos vazios nao sao incluidos no JSON;
- colunas mapeadas para termos DwC nao sao duplicadas em `dynamicProperties`.

## 8. Comando `validate`

### O que e validado

`validate` verifica o arquivo sem alterar os dados, incluindo:

- campos obrigatorios do perfil selecionado;
- formato/faixa de `decimalLatitude` e `decimalLongitude`;
- coerencia de par lat/lon (ambos devem existir juntos);
- consistencia de `day`, `month`, `year` (incompleto gera aviso; valores invalidos geram erro);
- divergencia de quantidade de colunas por linha (`column_mismatch`).

### Modo strict

Com `--strict`, a execucao retorna codigo `1` se houver qualquer linha com erro.

### Controle por `--max-errors`

`--max-errors` limita a quantidade de issues armazenadas no relatorio. Ao atingir o limite, a validacao e interrompida com aviso de truncamento no resumo.

### Relatorio JSON

Com `--report`, a CLI salva um relatorio contendo:

- `summary`: totais, perfil, delimitador detectado, duracao e status de truncamento;
- `issues`: lista de erros/avisos com `rowNumber`, `severity`, `code`, `messagePtBr`, `field` e `value`.

Exemplo resumido de relatorio:

```json
{
  "summary": {
    "totalRows": 3,
    "errorRows": 1,
    "warningRows": 1,
    "totalIssues": 2,
    "truncated": false,
    "profile": "occurrence",
    "strict": false,
    "delimiter": "\t"
  },
  "issues": [
    {
      "rowNumber": 2,
      "severity": "error",
      "code": "required_field_missing",
      "messagePtBr": "Campo obrigatorio ausente: occurrenceID",
      "field": "occurrenceID"
    },
    {
      "rowNumber": 3,
      "severity": "warning",
      "code": "incomplete_day_month_year",
      "messagePtBr": "Preenchimento parcial de day/month/year. Informe os tres campos para uma data completa."
    }
  ]
}
```

### Interpretacao dos erros

- `required_field_missing`: campo obrigatorio ausente;
- `invalid_decimal_latitude` / `invalid_decimal_longitude`: coordenada invalida ou fora da faixa;
- `require_lat_lon_pair`: apenas um dos campos lat/lon informado;
- `invalid_day_month_year`: valores de dia/mes/ano fora das regras;
- `column_mismatch`: quantidade de colunas da linha difere do cabecalho.

## 9. Comando `pack` (DwC-A)

### O que e gerado

`pack` transforma um arquivo Simple DwC em um `.zip` no formato Darwin Core Archive.

Estrutura tipica do zip:

```text
meu-dataset.dwca.zip
├── occurrence.txt
├── meta.xml
└── eml.xml
```

### `meta.xml`

`meta.xml` descreve:

- localizacao do core (`occurrence.txt`);
- indice do identificador (`<id index="..."/>`);
- mapeamento de cada coluna para URI DwC.

Quando uma coluna nao e reconhecida na whitelist DwC, ela e mapeada para o termo `dynamicProperties` e um warning e emitido no log.

### `eml.xml`

`eml.xml` pode ser:

- fornecido via `--eml <path>`;
- gerado automaticamente (padrao) quando `--eml` nao e informado e `--generate-eml true`.

Metadados opcionais para EML gerado:

- `--dataset-title`;
- `--dataset-description`;
- `--publisher`.

### `id-field`

`--id-field <term>` define qual coluna do cabecalho sera usada como identificador no `meta.xml`.

- padrao: `occurrenceID`;
- deve existir no cabecalho de entrada;
- se nao existir, o comando falha com erro estrutural.

Modo de depuracao:

- `--meta-only`: nao gera o `.zip`; grava apenas `<nome-saida>.meta.xml` ao lado do caminho informado em `--out`.

### Exemplo completo

```bash
occur2dwc pack \
  --in ./saida/occurrence.tsv \
  --out ./publicacao/dataset.dwca.zip \
  --delimiter tab \
  --id-field occurrenceID \
  --dataset-title "Inventario Floristico Regional" \
  --dataset-description "Ocorrencias validadas para publicacao em Darwin Core Archive." \
  --publisher "Instituicao Cientifica Exemplo"
```

## 10. Comando `init`

### O que e gerado

`init` cria uma estrutura base para iniciar o fluxo de publicacao com exemplos, templates e arquivos de apoio.

### Quando utilizar

Use `init` no inicio de um projeto, em novos diretorios de trabalho ou para padronizar a estrutura operacional entre equipes.

### Estrutura criada

Arquivos gerados pelo comando:

- `mapping.example.yml`
- `profiles/custom-profile.json`
- `examples/input.sample.csv`
- `examples/expected.simple.tsv`
- `examples/README.md`
- `eml.template.xml`
- `README.occur2dwc.md`

Exemplo:

```bash
occur2dwc init --dir ./projeto-dwc
```

Para sobrescrever arquivos existentes:

```bash
occur2dwc init --dir ./projeto-dwc --force
```

## 11. Preset CNCFlora / ProFlora

### Quando e aplicado automaticamente

Com `--preset auto` (padrao), a deteccao automatica do preset `cncflora-proflora` ocorre quando o cabecalho de entrada contem indicios como:

- `taxon_flora_id`
- `scientific_name`
- `decimal_latitude`

### Como forcar com `--preset cncflora-proflora`

```bash
occur2dwc convert \
  --in ./dados/proflora.csv \
  --out ./saida/occurrence.tsv \
  --preset cncflora-proflora
```

### Como desativar com `--preset none`

```bash
occur2dwc convert \
  --in ./dados/proflora.csv \
  --out ./saida/occurrence.tsv \
  --preset none
```

### Exemplo com CSV separado por ponto e virgula

```bash
occur2dwc convert \
  --in ./dados/proflora.csv \
  --out ./saida/occurrence.tsv \
  --input-delimiter semicolon \
  --preset cncflora-proflora
```

## 12. Profiles Disponiveis

Profiles suportados:

- `minimal-occurrence`
- `occurrence`
- `cncflora-occurrence`

Diferencas principais:

| Profile | Colunas de saida | Campos obrigatorios |
| --- | --- | --- |
| `minimal-occurrence` | conjunto minimo (`occurrenceID`, `scientificName`, `decimalLatitude`, `decimalLongitude`) | os 4 campos minimos |
| `occurrence` | perfil padrao de ocorrencia (inclui taxonomia, localidade, coleta, identificacao e observacoes) | `occurrenceID`, `scientificName`, `decimalLatitude`, `decimalLongitude` |
| `cncflora-occurrence` | igual ao `occurrence`, com termos adicionais institucionais (`basisOfRecord`, `institutionCode`, `ownerInstitutionCode`) | mesmo conjunto obrigatorio do profile `occurrence` |

## 13. Exemplos Completos

### Fluxo 1: CSV simples

```bash
occur2dwc convert \
  --in ./dados/entrada.csv \
  --out ./saida/occurrence.tsv \
  --map ./mapping.yml \
  --derive-eventdate \
  --report ./saida/convert.report.json

occur2dwc validate \
  --in ./saida/occurrence.tsv \
  --profile occurrence \
  --report ./saida/validate.report.json
```

### Fluxo 2: CSV ProFlora separado por ponto e virgula

```bash
occur2dwc convert \
  --in ./dados/proflora.csv \
  --out ./saida/proflora.occurrence.tsv \
  --input-delimiter semicolon \
  --preset cncflora-proflora \
  --profile cncflora-occurrence \
  --extras dynamicProperties \
  --report ./saida/proflora.convert.report.json

occur2dwc validate \
  --in ./saida/proflora.occurrence.tsv \
  --delimiter tab \
  --profile cncflora-occurrence \
  --strict \
  --report ./saida/proflora.validate.report.json
```

### Fluxo 3: Geracao de DwC-A completo

```bash
occur2dwc convert \
  --in ./dados/entrada.csv \
  --out ./saida/occurrence.tsv \
  --map ./mapping.yml \
  --report ./saida/convert.report.json

occur2dwc validate \
  --in ./saida/occurrence.tsv \
  --strict \
  --report ./saida/validate.report.json

occur2dwc pack \
  --in ./saida/occurrence.tsv \
  --out ./publicacao/dataset.dwca.zip \
  --id-field occurrenceID \
  --eml ./metadados/eml.xml
```

## 14. Tratamento de Erros e Codigos de Saida

Codigos principais:

- `0`: execucao concluida com sucesso;
- `1`: erro de validacao (tipicamente em `--strict`) ou erro inesperado;
- `2`: erro de uso (argumentos), estrutura de entrada ou IO.

Observacao operacional:

- interrupcao por sinal (`SIGINT`/`SIGTERM`) pode resultar em codigo `130`.

Uso de verbosidade:

- `--verbose`: habilita logs de debug e stack trace em falhas;
- `--quiet`: suprime logs informativos e warnings (erros continuam sendo exibidos).

## 15. Perguntas Frequentes

### Foram encontrados multiplos erros no relatorio. Como proceder?

Utilize `--max-errors` para controlar o volume de issues em datasets grandes e trate primeiro erros estruturais (`column_mismatch`, campos obrigatorios ausentes), pois eles afetam as validacoes subsequentes.

### `occurrenceID` esta ausente. O que fazer?

Defina mapeamento explicito para `occurrenceID` (`--map`) ou aplique `--id-strategy uuid`/`--id-strategy hash` no `convert` quando o identificador nao existir na origem.

### O delimitador parece incorreto. Como corrigir?

Informe explicitamente o delimitador:

- `convert`: `--input-delimiter <auto|comma|tab|semicolon>`
- `validate` e `pack`: `--delimiter <auto|tab|comma|semicolon>`

### Como limpar colunas extras?

Use `--extras drop` no `convert` para remover todas as colunas nao mapeadas da saida final.

### Como preservar colunas internas sem quebrar o perfil DwC?

Use `--extras dynamicProperties` para manter esses dados em JSON no campo `dynamicProperties`, ou `--extras keep` durante etapas de auditoria interna.

## 16. Boas Praticas

- sempre executar `validate` antes de `pack`;
- versionar os arquivos convertidos e os relatorios JSON;
- manter arquivo de mapeamento (`mapping.yml`/`mapping.json`) sob controle de versao;
- evitar sobrescrever dados originais de entrada;
- padronizar delimitador e codificacao por projeto;
- revisar `eml.xml` antes de publicacao externa.

## 17. Licenca

MIT.
