# Occur2DWC

CLI robusto para conversão e validação de dados de ocorrência para Darwin Core (DwC).

## Status

Marco **M0**: bootstrap completo do projeto com arquitetura, CLI e stubs.

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

Comandos disponíveis:

- `convert`: converte dados de ocorrência para DwC (stub no M0)
- `validate`: valida dados de ocorrência e estrutura DwC (stub no M0)
- `pack`: empacota artefatos de saída (stub no M0)
- `init`: inicializa estrutura/configuração local do projeto (stub no M0)

## Scripts

- `npm run build`: gera build em `dist/` com `tsup`
- `npm run typecheck`: valida tipos TypeScript
- `npm run lint`: executa ESLint
- `npm run format:check`: valida formatação com Prettier
- `npm run test`: roda testes em watch (Vitest)
- `npm run test:run`: roda testes uma vez
- `npm run coverage`: cobertura com c8 sobre o build (`dist/`) usando cenário smoke do CLI
- `npm run check`: lint + typecheck + test + build

## Arquitetura (M0)

Estrutura baseada em Clean Architecture:

- `src/domain`: entidades e regras de domínio base
- `src/application`: casos de uso e portas
- `src/infrastructure`: CLI, adapters e wiring
- `src/shared`: erros e utilitários compartilhados

Neste marco, os casos de uso estão como stubs para permitir evolução incremental.

## Qualidade e automação

- ESLint + Prettier
- Husky + lint-staged (pre-commit)
- CI com GitHub Actions

## Publicação no npm

O pacote já está preparado com:

- `bin` configurado (`occur2dwc`)
- `files` restrito para publicação
- `prepublishOnly` com checagens

## Licença

MIT
