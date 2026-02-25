# DWCA

## Objetivo

Gerar Darwin Core Archive (`.zip`) com estrutura minima valida para publicacao.

## Comando

```bash
occur2dwc pack --in occurrence.tsv --out dwca.zip
```

## Conteudo do ZIP

- `occurrence.txt` (sempre em TSV)
- `meta.xml`
- `eml.xml` (customizado com `--eml` ou gerado automaticamente)

## Meta-only

```bash
occur2dwc pack --in occurrence.tsv --out dwca.zip --meta-only
```

Gera `dwca.meta.xml` ao lado do arquivo de saida.

## Regras

- `--id-field` deve existir no header
- entradas com colunas desconhecidas sao mapeadas para `dynamicProperties` no `meta.xml` com warning
- escrita de ZIP em streaming

## Integridade

- o writer de ZIP finaliza com controle de erro
- em caso de falha/interrupcao, o fluxo aborta o archive em progresso
