# Validation

## Objetivo

Validar CSV/TSV sem transformar dados, com relatorio e comportamento previsivel para pipeline.

## Comando

```bash
occur2dwc validate --in data.tsv
```

## Regras de validacao atuais

- campos obrigatorios por profile
- `occurrenceID` obrigatorio
- `scientificName` obrigatorio
- faixa de latitude e longitude
- par latitude/longitude obrigatorio
- consistencia de `day/month/year`

## Relatorio JSON

Com `--report`, o CLI salva:

- `summary` (linhas, issues, duracao)
- `issues` (erro/warning por linha)

## Strict mode

```bash
occur2dwc validate --in data.tsv --strict
```

- sem erros: `exit 0`
- com erros: `exit 1`

## Dica operacional

Use `--max-errors` para truncar coleta em arquivos muito grandes e manter previsibilidade de tempo.
