# Architecture

## Estilo adotado

Clean Architecture com separacao de responsabilidades:

- regras de negocio no dominio/aplicacao
- infraestrutura isolada em adapters e CLI
- casos de uso orquestrando fluxo

## Camadas

- `src/domain`: tipos e erros de dominio
- `src/application`: casos de uso de alto nivel e servicos de conversao
- `src/core`: use cases centrais (validacao e pack)
- `src/infrastructure`: CLI, wiring, presenters
- `src/adapters`: integrações concretas (ZIP, IO)
- `src/shared`: logger, erros e utilitarios comuns

## Streaming

Pontos chave:

- leitura de CSV/TSV linha a linha (`readline`)
- escrita incremental de saida Simple DwC
- empacotamento DwC-A sem carregar dataset inteiro em memoria

## Extensoes DwC futuras

Para incluir extensoes (ex.: MeasurementOrFact):

1. adicionar novo builder de metadados em `src/dwca`
2. expandir packer para novos arquivos no ZIP
3. atualizar referencia de CLI e testes de integracao

## Contribuicao tecnica

- manter TypeScript strict
- incluir testes para comportamento novo
- preservar mensagens de CLI em PT-BR
- manter funcoes e variaveis em ingles
