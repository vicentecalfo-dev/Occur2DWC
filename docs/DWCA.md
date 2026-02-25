# DwC-A no Occur2DWC

Este documento descreve a geração de Darwin Core Archive (DwC-A) no `occur2dwc`.

## O que é DwC-A

DwC-A é um pacote ZIP com arquivos textuais e metadados padronizados para publicação de dados de biodiversidade.

No M3, o `occur2dwc pack` gera um archive com core `Occurrence`.

## Comando

```bash
occur2dwc pack --in occurrence.tsv --out dwca.zip
```

## Conteúdo do ZIP

- `occurrence.txt`: dados em TSV UTF-8, com header
- `meta.xml`: descrição estrutural do core
- `eml.xml`: metadado EML (customizado ou gerado)

## Exemplo com EML customizado

```bash
occur2dwc pack \
  --in occurrence.tsv \
  --out dwca.zip \
  --eml ./meu-eml.xml
```

## Exemplo com EML gerado

```bash
occur2dwc pack \
  --in occurrence.tsv \
  --out dwca.zip \
  --generate-eml true \
  --dataset-title "Coleção Botânica" \
  --dataset-description "Ocorrências revisadas" \
  --publisher "JBRJ"
```

## Modo meta-only

Para depuração de mapeamento de colunas e índice de ID:

```bash
occur2dwc pack --in occurrence.tsv --out dwca.zip --meta-only
```

Neste modo, o CLI gera `dwca.meta.xml` ao lado do `--out`.

## Regras importantes

- `--id-field` precisa existir no header (padrão `occurrenceID`)
- input pode ser CSV/TSV; output interno no archive sempre `occurrence.txt` em TSV
- line endings normalizados para `\n`

## meta.xml gerado

Características:

- namespace `http://rs.tdwg.org/dwc/text/`
- `core` com `rowType` de Occurrence
- `ignoreHeaderLines="1"`
- `fieldsTerminatedBy="\t"`
- `<id index="X"/>` com índice 0-based do campo de ID

Colunas não reconhecidas na whitelist interna de termos DwC são mapeadas para `dynamicProperties` com warning de log.

## Exit codes

- `0`: sucesso
- `2`: erro de uso/IO (ex.: sem `--in`, sem `--out`, `id-field` ausente no header)
