# Mapping

## Objetivo

O mapping define como colunas de entrada viram termos Darwin Core.

## Arquivo

Use `mapping.example.yml` como base.

Campos principais:

- `version`: versao do schema de mapping (`1`)
- `idStrategy`: `preserve|uuid|hash`
- `mappings`: relacao `coluna_origem: termo_dwc`
- `extras`: colunas extras que podem ser preservadas

## Exemplo rapido

```yaml
version: 1
idStrategy: preserve
mappings:
  id_registro: occurrenceID
  nome_cientifico: scientificName
  latitude: decimalLatitude
  longitude: decimalLongitude
extras:
  - habitat
```

## Estrategias para extras

No comando `convert`:

- `--extras keep`: mantem colunas extras como colunas adicionais
- `--extras drop`: remove extras
- `--extras dynamicProperties`: agrega extras em JSON no campo `dynamicProperties`

## Boas praticas

- normalize nomes de coluna na origem
- garanta `occurrenceID` e `scientificName`
- sempre valide com `occur2dwc validate --report`
