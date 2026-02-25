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
- `--extras dynamicProperties` (padrao): agrega extras em JSON no campo `dynamicProperties`

## Presets de mapping

O `convert` suporta preset interno `cncflora-proflora`.

- `--preset auto` (padrao):
  - ativa automaticamente quando o cabecalho tiver `taxon_flora_id`, `scientific_name` ou `decimal_latitude`
- `--preset cncflora-proflora`:
  - forca uso do mapping interno
- `--preset none`:
  - desliga presets internos e usa apenas auto-map/synonyms (exceto se `--map` for informado)

`--map` sempre tem prioridade sobre qualquer preset.

Exemplo:

```bash
occur2dwc convert --in dados.csv --out occurrence.tsv --input-delimiter semicolon --preset cncflora-proflora
```

## Boas praticas

- normalize nomes de coluna na origem
- garanta `occurrenceID` e `scientificName`
- sempre valide com `occur2dwc validate --report`
