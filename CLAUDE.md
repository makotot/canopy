# Canopy

A CLI tool that statically analyzes React component render trees and visualizes them as Mermaid flowcharts.

## Package Scope

Use the `@makotot/` scope.

- `@makotot/canopy-core`
- `@makotot/canopy-cli`
- `@makotot/canopy-annotator-async`
- `@makotot/canopy-annotator-client-boundary`
- `@makotot/canopy-annotator-suspense`
- `@makotot/canopy-annotator-context`
- `@makotot/canopy-annotator-portal`
- `@makotot/canopy-annotator-external`
- `@makotot/canopy-reporter-mermaid`
- `@makotot/canopy-reporter-json`

## Development

### TDD Style

Write tests before implementation.

- **Cycle**: write a failing test → implement → make it green
- **Unit tests**: per function (`analyzeRenderTree`, each annotator, each reporter)
- **Snapshot tests (integration)**: fixture `.tsx` files → assert Mermaid output as a string
- **Fixture-driven**: define input fixtures and expected output before porting implementation from the PoC
- **Coverage target**: 50% for v0.1 (core unit tests + minimum snapshots)

### Annotator Package Structure

Split each annotator into its own package (`packages/annotator-*/`) from v0.1.

## Tech Stack

- **Build**: `tsc` only
- **Module**: ESM only
- **Node.js**: latest LTS (v24)
- **Package manager**: pnpm workspaces
- **Test**: vitest + coverage (v8)
- **Lint**: ESLint
- **Format**: Prettier
- **Release**: Changesets
- **npm provenance**: required (publish via GitHub Actions)
