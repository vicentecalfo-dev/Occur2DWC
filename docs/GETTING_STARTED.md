# Getting Started

## 1) Requisitos

- Node.js 20+
- npm 10+

## 2) Instalacao

```bash
npm install
npm run build
```

## 3) Inicializar projeto

```bash
occur2dwc init
# ou
occur2dwc init --dir meu-projeto
```

Estrutura criada:

- `mapping.example.yml`
- `profiles/custom-profile.json`
- `examples/input.sample.csv`
- `examples/expected.simple.tsv`
- `examples/README.md`
- `eml.template.xml`
- `README.occur2dwc.md`

## 4) Converter

```bash
occur2dwc convert \
  --in ./examples/input.sample.csv \
  --out ./examples/output.simple.tsv \
  --map ./mapping.example.yml
```

## 5) Validar

```bash
occur2dwc validate \
  --in ./examples/output.simple.tsv \
  --report ./examples/validate.report.json
```

## 6) Empacotar em DwC-A

```bash
occur2dwc pack \
  --in ./examples/output.simple.tsv \
  --out ./examples/output.dwca.zip \
  --eml ./eml.template.xml
```

## Flags globais praticas

- `--log-format text|json`
- `--quiet`
- `--verbose`
- `--no-color`
