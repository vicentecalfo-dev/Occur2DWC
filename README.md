# Occur2DWC

CLI robusto para conversão e validação de dados de ocorrência para Darwin Core (DwC).

## Status

Marco **M2**: comando `validate` implementado com relatório, strict mode, controle de `max-errors` e logs estruturados.

## Requisitos

- Node.js LTS (recomendado: Node 20+)
- npm 10+

## Instalação

```bash
npm install
```

## Uso (desenvolvimento)

```bash
npm run dev
```

## Uso (CLI)

Após build:

```bash
npm run build
node dist/cli.js --help
```

## Comando convert

Uso básico:

```bash
occur2dwc convert --in ./entrada.csv --out ./saida.tsv
```

Se `--in` não for informado, o comando lê de `stdin`.

### Flags

- `--in <path>`: arquivo de entrada (opcional; se ausente, stdin)
- `--out <path>`: arquivo de saída (obrigatório)
- `--map <path>`: arquivo de mapeamento YAML/JSON
- `--profile <minimal-occurrence|occurrence|cncflora-occurrence>` (padrão: `occurrence`)
- `--input-delimiter <auto|comma|tab|semicolon>` (padrão: `auto`)
- `--output-delimiter <tab|comma>` (padrão: `tab`)
- `--encoding <utf8|latin1>` (padrão: `utf8`)
- `--strict`: falha se houver qualquer erro de validação
- `--report <path>`: salva relatório JSON
- `--max-errors <n>` (padrão: `1000`)
- `--id-strategy <preserve|uuid|hash>` (padrão efetivo: `preserve`)
- `--derive-eventdate`: deriva `eventDate` ISO-8601 com `day/month/year`
- `--extras <keep|drop|dynamicProperties>` (padrão: `keep`)
- `--normalize-html-entities`: decodifica entidades HTML como `&amp;`

### Delimitador automático de entrada

Quando `--input-delimiter auto`:

- usa `tab` se o cabeçalho tiver `\t`
- senão usa `semicolon` se o cabeçalho tiver `;`
- senão usa `comma`

### Mapping

Exemplo completo em [`mapping.example.yml`](./mapping.example.yml).

## Validação de arquivos

Uso básico:

```bash
occur2dwc validate --in ./dados.tsv
```

Uso com relatório:

```bash
occur2dwc validate --in ./dados.tsv --report ./report.json
```

### Flags do validate

- `--in <path>`: arquivo de entrada (obrigatório)
- `--profile <minimal-occurrence|occurrence|cncflora-occurrence>` (padrão: `occurrence`)
- `--delimiter <auto|tab|comma|semicolon>` (padrão: `auto`)
- `--encoding <utf8|latin1>` (padrão: `utf8`)
- `--report <path>`: salva relatório JSON
- `--strict`: retorna erro se houver erros de validação
- `--max-errors <n>` (padrão: `1000`)
- `--log-format <text|json>` (padrão: `text`)
- `--quiet`: suprime logs de info/warn
- `--verbose`: habilita logs de debug

### O que o validate verifica

- campos obrigatórios do profile
- `scientificName` obrigatório
- `occurrenceID` obrigatório
- `decimalLatitude` no intervalo `[-90, 90]`
- `decimalLongitude` no intervalo `[-180, 180]`
- presença em par de lat/lon (`requireLatLonPair`)
- consistência de `day/month/year` (`validateDayMonthYear`)

O comando `validate` **não transforma dados**, apenas valida.

### Strict mode

- com `--strict`: qualquer erro de validação retorna `exit 1`
- sem `--strict`: retorna `exit 0` e apenas reporta falhas

### Exemplo de relatório

```json
{
  "summary": {
    "totalRows": 120,
    "errorRows": 8,
    "warningRows": 4,
    "totalIssues": 15,
    "truncated": false,
    "startTime": "2026-02-25T12:00:00.000Z",
    "endTime": "2026-02-25T12:00:00.300Z",
    "durationMs": 300,
    "profile": "occurrence",
    "strict": false,
    "delimiter": "\t"
  },
  "issues": [
    {
      "rowNumber": 7,
      "severity": "error",
      "code": "required_field_missing",
      "messagePtBr": "Campo obrigatório ausente: occurrenceID",
      "field": "occurrenceID"
    }
  ]
}
```

### Exit codes

- `0`: validação executada (com ou sem erros, quando não strict)
- `1`: erros encontrados com `--strict`
- `2`: erro de uso, entrada inválida ou erro de IO

Detalhes em [`docs/VALIDATION.md`](./docs/VALIDATION.md).

## Scripts

- `npm run build`: gera build em `dist/` com `tsup`
- `npm run typecheck`: valida tipos TypeScript
- `npm run lint`: executa ESLint
- `npm run format:check`: valida formatação com Prettier
- `npm run test`: roda testes em watch (Vitest)
- `npm run test:run`: roda testes uma vez
- `npm run coverage`: cobertura com Vitest (threshold global de 90% para módulos de validação)
- `npm run coverage:c8`: cobertura smoke com c8 sobre o build (`dist/`)
- `npm run check`: lint + typecheck + test + build

## Arquitetura

Estrutura baseada em Clean Architecture:

- `src/core`: casos de uso centrais
- `src/validation`: engine e coleta de issues
- `src/application`: serviços de aplicação
- `src/infrastructure`: CLI, adapters e wiring
- `src/shared`: utilitários, logger e erros compartilhados

## Qualidade e automação

- ESLint + Prettier
- Husky + lint-staged (pre-commit)
- CI com GitHub Actions
- Vitest (unitários + integração)

## Publicação no npm

O pacote está preparado para publicação com:

- `bin` configurado (`occur2dwc`)
- `files` restrito para publicação
- `prepublishOnly` com checagens

## Licença

MIT
