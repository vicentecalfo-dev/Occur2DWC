# Occur2DWC

CLI robusto para conversão e validação de dados de ocorrência para Darwin Core (DwC).

## Status

Marco **M3**: suporte a **DwC-A (Darwin Core Archive)** com comando `pack`, geração de `meta.xml`, `eml.xml` e empacotamento `.zip`.

## Requisitos

- Node.js LTS (recomendado: Node 20+)
- npm 10+

## Instalação

```bash
npm install
```

## Uso (CLI)

Após build:

```bash
npm run build
node dist/cli.js --help
```

## Fluxo recomendado (M3)

No M3, o fluxo recomendado é em **2 etapas**:

1. `convert` para gerar Simple DwC (`.tsv`)
2. `pack` para gerar DwC-A (`.zip`)

Exemplo:

```bash
occur2dwc convert --in ./entrada.csv --out ./occurrence.tsv --output-delimiter tab
occur2dwc pack --in ./occurrence.tsv --out ./dwca.zip
```

> `convert --format dwca` ainda não está habilitado neste marco.

## Comando convert

Uso básico:

```bash
occur2dwc convert --in ./entrada.csv --out ./saida.tsv
```

Se `--in` não for informado, o comando lê de `stdin`.

Flags principais:

- `--in <path>`
- `--out <path>`
- `--map <path>`
- `--profile <minimal-occurrence|occurrence|cncflora-occurrence>`
- `--input-delimiter <auto|comma|tab|semicolon>`
- `--output-delimiter <tab|comma>`
- `--encoding <utf8|latin1>`
- `--strict`
- `--report <path>`
- `--max-errors <n>`
- `--id-strategy <preserve|uuid|hash>`
- `--derive-eventdate`
- `--extras <keep|drop|dynamicProperties>`
- `--normalize-html-entities`

## Comando validate

Uso básico:

```bash
occur2dwc validate --in ./dados.tsv
```

Suporta relatório estruturado, strict mode, logs `text/json` e controle de `max-errors`.

Detalhes completos: [`docs/VALIDATION.md`](./docs/VALIDATION.md).

## Comando pack (DwC-A)

Uso básico:

```bash
occur2dwc pack --in ./occurrence.tsv --out ./dwca.zip
```

Flags:

- `--in <path>`: arquivo Simple DwC (obrigatório)
- `--out <path>`: arquivo `.zip` de saída (obrigatório)
- `--core <occurrence>` (padrão: `occurrence`)
- `--delimiter <auto|tab|comma|semicolon>` (padrão: `auto`)
- `--encoding <utf8|latin1>` (padrão: `utf8`)
- `--id-field <term>` (padrão: `occurrenceID`)
- `--meta-only`: gera apenas `meta.xml` ao lado do `--out`
- `--eml <path>`: usa EML customizado
- `--generate-eml <true|false>` (padrão: `true`)
- `--dataset-title <string>`
- `--dataset-description <string>`
- `--publisher <string>`
- `--log-format <text|json>` (padrão: `text`)
- `--quiet`
- `--verbose`

Validações mínimas no pack:

- cabeçalho válido
- presença de `--id-field` no header

Se falhar, retorna `exit code 2`.

### O que entra no ZIP

- `occurrence.txt` (TSV UTF-8, header na primeira linha)
- `meta.xml` (core `Occurrence`, índice de ID correto)
- `eml.xml` (customizado via `--eml` ou gerado automaticamente)

### Biblioteca ZIP

O projeto usa **archiver** por suportar escrita em streaming para ZIP, reduzindo uso de memória em arquivos grandes.

Detalhes completos de DwC-A: [`docs/DWCA.md`](./docs/DWCA.md).

## Scripts

- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run test`
- `npm run test:run`
- `npm run coverage`: cobertura Vitest com threshold >= 90% (escopo configurado)
- `npm run coverage:c8`: cobertura smoke via c8 no build
- `npm run check`: lint + typecheck + test + build

## Arquitetura

- `src/core`: use cases centrais
- `src/validation`: engine/coletor de issues
- `src/dwca`: geração de `meta.xml`, `eml.xml` e packer DwC-A
- `src/adapters`: adapters de infraestrutura (inclui wrapper de ZIP)
- `src/infrastructure`: CLI/wiring
- `src/shared`: logger e erros compartilhados

## Qualidade e automação

- ESLint + Prettier
- Husky + lint-staged
- Vitest (unitários + integração)
- CI GitHub Actions

## Publicação no npm

- `bin` configurado (`occur2dwc`)
- `prepublishOnly` com `npm run check`

## Licença

MIT
