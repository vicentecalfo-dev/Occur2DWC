# Occur2DWC

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-90%25%2B-success)
![npm version](https://img.shields.io/badge/npm-0.1.0-blue)

CLI em TypeScript para converter, validar e empacotar dados de ocorrencia no padrao Darwin Core (Simple DwC e DwC-A).

## Motivacao

Publicar dados de biodiversidade exige padrao, rastreabilidade e metadados consistentes. O Occur2DWC organiza esse fluxo em comandos claros para equipes tecnicas e curadores de dados.

## Funcionalidades

- `init`: cria estrutura inicial de projeto com exemplos e templates
- `convert`: converte CSV/TSV para Simple DwC com mapeamento e validacao de linha
- `validate`: valida datasets sem transformar dados, com relatorio JSON
- `pack`: gera Darwin Core Archive (`.zip`) com `occurrence.txt`, `meta.xml` e `eml.xml`
- logs `text` ou `json`, `--quiet`, `--verbose` e colorizacao opcional

## Instalacao

```bash
npm install
npm run build
```

Uso local:

```bash
node dist/cli.js --help
```

Uso via pacote:

```bash
npx occur2dwc --help
```

## Exemplos rapidos

```bash
occur2dwc init

occur2dwc convert \
  --in ./examples/input.sample.csv \
  --out ./examples/output.simple.tsv \
  --map ./mapping.example.yml \
  --derive-eventdate

occur2dwc validate \
  --in ./examples/output.simple.tsv \
  --report ./examples/validate.report.json

occur2dwc pack \
  --in ./examples/output.simple.tsv \
  --out ./examples/output.dwca.zip \
  --eml ./eml.template.xml
```

## Fluxo recomendado

1. `occur2dwc init` para scaffold inicial
2. ajustar `mapping.example.yml` ao seu arquivo de origem
3. rodar `convert` para gerar Simple DwC
4. rodar `validate` com `--report`
5. rodar `pack` para produzir o DwC-A final

## Arquitetura resumida

- `src/application`: casos de uso e servicos de aplicacao
- `src/core`: casos de uso centrais de validacao e empacotamento
- `src/validation`: engine e coletor de issues
- `src/dwca`: geracao de `meta.xml`, `eml.xml` e fluxo de empacotamento
- `src/adapters`: adaptadores de infraestrutura (ZIP, IO)
- `src/infrastructure`: CLI, wiring e apresentacao
- `src/shared`: erros, logging e utilitarios de runtime

A base segue principios de Clean Architecture com separacao clara entre dominio, aplicacao e infraestrutura.

## Documentacao

- [Getting Started](./docs/GETTING_STARTED.md)
- [Referencia do CLI](./docs/CLI_REFERENCE.md)
- [Mapeamento](./docs/MAPPING.md)
- [Profiles](./docs/PROFILES.md)
- [Validacao](./docs/VALIDATION.md)
- [DwC-A](./docs/DWCA.md)
- [Arquitetura](./docs/ARCHITECTURE.md)

## Contribuicao

1. abra uma issue com contexto e objetivo
2. implemente com testes
3. rode `npm run check`
4. envie PR com descricao tecnica e evidencias

## Roadmap futuro

- suporte nativo a extensoes DwC-A (MeasurementOrFact, Multimidia, etc.)
- mais perfis de validacao customizaveis por arquivo
- melhorias de observabilidade para pipelines grandes
- distribuicao em container oficial

## Publicacao no npm

- `bin` configurado para `occur2dwc`
- `files` com whitelist (`dist`, `docs`, `README.md`, `LICENSE`)
- `engines` definido para Node `>=20`
- `prepublishOnly` executa build + testes

## Licenca

MIT
