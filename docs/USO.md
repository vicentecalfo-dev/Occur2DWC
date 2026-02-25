# Uso do Occur2DWC

## Fluxo recomendado no M3

### 1) Converter para Simple DwC

```bash
occur2dwc convert \
  --in ./entrada.csv \
  --out ./occurrence.tsv \
  --output-delimiter tab \
  --profile occurrence
```

### 2) Validar o resultado

```bash
occur2dwc validate \
  --in ./occurrence.tsv \
  --report ./validation-report.json
```

### 3) Empacotar em DwC-A

```bash
occur2dwc pack \
  --in ./occurrence.tsv \
  --out ./dwca.zip \
  --dataset-title "Dataset Occur2DWC" \
  --publisher "Occur2DWC"
```

## Logs

Todos os comandos principais suportam:

- `--log-format text|json`
- `--quiet`
- `--verbose`

## Observação

No M3, o caminho oficial para gerar DwC-A é:

1. `convert` (simple)
2. `pack` (dwca)

O modo direto `convert --format dwca` ainda não foi habilitado.
