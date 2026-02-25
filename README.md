# Occur2DWC

CLI robusto para conversão e validação de dados de ocorrência para Darwin Core (DwC).

## Status

Marco **M1**: comando `convert` implementado (Opção A: Simple DwC) com streaming, mapping, profiles, validação e relatório.

## Requisitos

- Node.js LTS (recomendado: Node 20+)
- npm 10+

## Instalação

```bash
npm install
```

## Uso (desenvolvimento)

```bash
npm run dev
```

## Uso (CLI)

Após build:

```bash
npm run build
node dist/cli.js --help
```

## Comando convert

Uso básico:

```bash
occur2dwc convert --in ./entrada.csv --out ./saida.tsv
```

Se `--in` não for informado, o comando lê de `stdin`.

### Flags

- `--in <path>`: arquivo de entrada (opcional; se ausente, stdin)
- `--out <path>`: arquivo de saída (obrigatório)
- `--map <path>`: arquivo de mapeamento YAML/JSON
- `--profile <minimal-occurrence|occurrence|cncflora-occurrence>` (padrão: `occurrence`)
- `--input-delimiter <auto|comma|tab|semicolon>` (padrão: `auto`)
- `--output-delimiter <tab|comma>` (padrão: `tab`)
- `--encoding <utf8|latin1>` (padrão: `utf8`)
- `--strict`: falha se houver qualquer erro de validação
- `--report <path>`: salva relatório JSON
- `--max-errors <n>` (padrão: `1000`)
- `--id-strategy <preserve|uuid|hash>` (padrão efetivo: `preserve`)
- `--derive-eventdate`: deriva `eventDate` ISO-8601 com `day/month/year`
- `--extras <keep|drop|dynamicProperties>` (padrão: `keep`)
- `--normalize-html-entities`: decodifica entidades HTML como `&amp;`

### Delimitador automático de entrada

Quando `--input-delimiter auto`:

- usa `tab` se o cabeçalho tiver `\t`
- senão usa `semicolon` se o cabeçalho tiver `;`
- senão usa `comma`

### Mapping

Exemplo completo em [`mapping.example.yml`](./mapping.example.yml).

Formato suportado:

```yaml
version: 1
idStrategy: preserve
mappings:
  occurrenceid: occurrenceID
  scientificName: scientificName
extras:
  - category
  - fonte
```

### Extras

- `keep`: mantém colunas extras após as colunas do profile
- `drop`: remove colunas extras
- `dynamicProperties`: empacota extras em `dynamicProperties` (JSON string)

### Validação mínima

O `convert` valida:

- presença de `occurrenceID`
- presença de `scientificName`
- `decimalLatitude` numérico no intervalo `[-90, 90]`
- `decimalLongitude` numérico no intervalo `[-180, 180]`

Erros podem ser exportados no relatório com `--report`.

## Scripts

- `npm run build`: gera build em `dist/` com `tsup`
- `npm run typecheck`: valida tipos TypeScript
- `npm run lint`: executa ESLint
- `npm run format:check`: valida formatação com Prettier
- `npm run test`: roda testes em watch (Vitest)
- `npm run test:run`: roda testes uma vez
- `npm run coverage`: cobertura com c8 sobre o build (`dist/`)
- `npm run check`: lint + typecheck + test + build

## Arquitetura

Estrutura baseada em Clean Architecture:

- `src/domain`: entidades e regras de domínio
- `src/application`: casos de uso e serviços de aplicação
- `src/infrastructure`: CLI, adapters e wiring
- `src/shared`: erros e utilitários compartilhados

## Qualidade e automação

- ESLint + Prettier
- Husky + lint-staged (pre-commit)
- CI com GitHub Actions
- Vitest (unitários + integração)

## Publicação no npm

O pacote está preparado para publicação com:

- `bin` configurado (`occur2dwc`)
- `files` restrito para publicação
- `prepublishOnly` com checagens

## Licença

MIT
