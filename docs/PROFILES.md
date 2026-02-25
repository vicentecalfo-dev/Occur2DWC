# Profiles

## O que e profile

Profile define colunas de saida e campos obrigatorios para validacao.

## Profiles nativos

- `minimal-occurrence`
- `occurrence`
- `cncflora-occurrence`

## Escolha rapida

- use `minimal-occurrence` para pipelines enxutos
- use `occurrence` para publicacao geral
- use `cncflora-occurrence` para campos adicionais de contexto institucional

## Fuzzy suggestion

Se houver erro de digitacao no profile, o CLI sugere a opcao mais proxima:

- entrada: `--profile occurrenc`
- sugestao: `Voce quis dizer: occurrence?`

## Profile customizado

`profiles/custom-profile.json` e um modelo para evolucao do projeto.

Campos esperados no modelo:

- `columns`
- `required`
- `rules`

A extensao de profile customizado pode ser acoplada aos casos de uso em `src/application/services/convert/profiles.ts`.
