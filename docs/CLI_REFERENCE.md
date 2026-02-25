# CLI Reference

## Geral

```bash
occur2dwc --help
occur2dwc <comando> --help
```

Exit codes:

- `0`: sucesso
- `1`: erro de validacao em modo `--strict` ou erro inesperado
- `2`: erro de uso, estrutura de entrada ou IO/permissao
- `130`: interrupcao por sinal (`SIGINT`/`SIGTERM`)

## init

```bash
occur2dwc init [--dir <path>] [--force]
```

Opcoes:

- `--dir <path>`: diretorio de destino (padrao: atual)
- `--force`: sobrescreve arquivos existentes
- `--log-format <text|json>`
- `--quiet`
- `--verbose`
- `--no-color`

## convert

```bash
occur2dwc convert --out <path> [opcoes]
```

Opcoes principais:

- `--in <path>`
- `--out <path>`
- `--map <path>`
- `--profile <minimal-occurrence|occurrence|cncflora-occurrence>`
- `--input-delimiter <auto|comma|tab|semicolon>`
- `--output-delimiter <tab|comma>`
- `--encoding <utf8|latin1>`
- `--strict`
- `--report <path>`
- `--max-errors <n>`
- `--id-strategy <preserve|uuid|hash>`
- `--derive-eventdate`
- `--extras <keep|drop|dynamicProperties>`
- `--normalize-html-entities`
- `--log-format <text|json>`
- `--quiet`
- `--verbose`
- `--no-color`

## validate

```bash
occur2dwc validate --in <path> [opcoes]
```

Opcoes principais:

- `--in <path>`
- `--profile <minimal-occurrence|occurrence|cncflora-occurrence>`
- `--delimiter <auto|tab|comma|semicolon>`
- `--encoding <utf8|latin1>`
- `--report <path>`
- `--strict`
- `--max-errors <n>`
- `--log-format <text|json>`
- `--quiet`
- `--verbose`
- `--no-color`

## pack

```bash
occur2dwc pack --in <path> --out <path> [opcoes]
```

Opcoes principais:

- `--in <path>`
- `--out <path>`
- `--core <occurrence>`
- `--delimiter <auto|tab|comma|semicolon>`
- `--encoding <utf8|latin1>`
- `--id-field <term>`
- `--meta-only`
- `--eml <path>`
- `--generate-eml <true|false>`
- `--dataset-title <string>`
- `--dataset-description <string>`
- `--publisher <string>`
- `--log-format <text|json>`
- `--quiet`
- `--verbose`
- `--no-color`
