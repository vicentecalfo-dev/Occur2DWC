# Validação de arquivos no Occur2DWC

Este documento descreve o comportamento do comando `occur2dwc validate`.

## Objetivo

Validar arquivos CSV/TSV em perfil Simple DwC sem transformar os dados, produzindo:

- logs de execução (`text` ou `json`)
- relatório estruturado (`--report`)
- exit code compatível com modo strict

## Uso

```bash
occur2dwc validate --in data.tsv
occur2dwc validate --in data.tsv --report report.json
occur2dwc validate --in data.tsv --profile minimal-occurrence
occur2dwc validate --in data.tsv --strict
occur2dwc validate --in data.tsv --max-errors 200
occur2dwc validate --in data.tsv --log-format json
```

## Flags

- `--in <path>`: arquivo de entrada (obrigatório)
- `--profile <minimal-occurrence|occurrence|cncflora-occurrence>` (padrão: `occurrence`)
- `--delimiter <auto|tab|comma|semicolon>` (padrão: `auto`)
- `--encoding <utf8|latin1>` (padrão: `utf8`)
- `--report <path>`: caminho do relatório JSON
- `--strict`: falha com `exit 1` se houver qualquer erro
- `--max-errors <n>` (padrão: `1000`)
- `--log-format <text|json>` (padrão: `text`)
- `--quiet`: mantém apenas logs de erro
- `--verbose`: habilita logs debug

## Streaming e delimitador

- leitura em streaming (sem carregar arquivo inteiro na memória)
- delimitador automático (`--delimiter auto`):
  - `\t` se o cabeçalho contiver tab
  - `;` se o cabeçalho contiver ponto e vírgula
  - `,` caso contrário

## Regras de validação

Por linha, o validador verifica:

- campos obrigatórios do profile
- `occurrenceID` obrigatório
- `scientificName` obrigatório
- `decimalLatitude` em `[-90, 90]`
- `decimalLongitude` em `[-180, 180]`
- `decimalLatitude` e `decimalLongitude` em par (`requireLatLonPair`)
- consistência de `day/month/year` (`validateDayMonthYear`)

## Relatório JSON

Quando `--report` é informado, o arquivo é salvo com esta estrutura:

```json
{
  "summary": {
    "totalRows": 0,
    "errorRows": 0,
    "warningRows": 0,
    "totalIssues": 0,
    "truncated": false,
    "startTime": "",
    "endTime": "",
    "durationMs": 0,
    "profile": "occurrence",
    "strict": false,
    "delimiter": "\t"
  },
  "issues": [
    {
      "rowNumber": 1,
      "severity": "error",
      "code": "required_field_missing",
      "messagePtBr": "Campo obrigatório ausente: occurrenceID",
      "field": "occurrenceID",
      "value": ""
    }
  ]
}
```

### Truncation por `--max-errors`

- quando o número de issues ultrapassa `--max-errors`, a validação para
- `summary.truncated` passa a `true`
- `summary.totalIssues` mantém a contagem total encontrada até a interrupção

## Strict mode e exit codes

- `0`: validação concluída sem strict, mesmo com erros
- `1`: erros encontrados com `--strict`
- `2`: erro de uso (flags obrigatórias), formato inválido ou erro de IO

## Logs estruturados

`--log-format json` gera uma linha JSON por evento, por exemplo:

```json
{
  "timestamp": "2026-02-25T12:00:00.000Z",
  "level": "info",
  "message": "Iniciando validação de arquivo.",
  "meta": { "input": "data.tsv", "profile": "occurrence", "maxErrors": 1000 }
}
```

No modo `text`, os logs são amigáveis para terminal.
