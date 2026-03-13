# Interactive Mode (`-i`) for `@makotot/canopy-cli` Design

- **Date**: 2026-03-14

## Overview

Add a `-i` flag to `@makotot/canopy-cli` that launches an interactive prompt-driven flow, allowing users to select the entry point file, component name, and annotators without memorizing flag syntax.

## Motivation

Specifying `--annotator` repeatedly on every invocation is cumbersome and reduces practicality. Interactive mode removes the need to remember flag names and available annotator identifiers.

## UX Flow

```
$ canopy -i

┌  canopy
│
◇  Entry point file
│  app/page.tsx
│
◇  Component name (optional — leave blank to use default export)
│
◆  Select annotators
│  ◉ async
│  ◯ client-boundary
└
```

After confirmation, the pipeline runs and outputs the Mermaid flowchart to stdout, identical to non-interactive mode.

## Behaviour Rules

- `-i` with positional `<file>` or `--annotator` or `--component`: `-i` takes priority; other args and flags are ignored.
- Non-TTY environment with `-i`: exit with a clear error message ("Interactive mode requires a TTY").
- Reporter selection: deferred until multiple reporters are available.

## Scope

Changes are limited to `@makotot/canopy-cli` only. No other packages are affected.

## File Changes

| File                              | Change                                                           |
| --------------------------------- | ---------------------------------------------------------------- |
| `packages/cli/src/cli.ts`         | Add `-i` boolean option; branch to `runInteractive()` or `run()` |
| `packages/cli/src/interactive.ts` | New file — prompt logic using `@clack/prompts`                   |
| `packages/cli/package.json`       | Add `@clack/prompts` dependency; `cac` remains                   |

## Tests

Not written. `interactive.ts` is thin UI glue code (prompts → `run()`), and `run()` is already covered by existing tests.

## Implementation Detail

### `interactive.ts`

```ts
import type { Out } from '@makotot/canopy-core';

export async function runInteractive(out: Out): Promise<void>;
```

Prompt steps:

1. `text()` — entry point file path (required)
2. `text()` — component name (optional, blank = default export)
3. `multiselect()` — annotators built from the same `ANNOTATORS` map defined in `run.ts`
4. Call `run(filePath, out, undefined, componentName || undefined, selectedAnnotators)`

### `cli.ts`

```ts
cli
  .command('[file]', '...')
  .option('-i, --interactive', 'Launch interactive mode')
  .option('--component <name>', '...')
  .option('--annotator <name>', '...', { type: [] })
  .action(async (file, options) => {
    if (options.interactive) {
      await runInteractive(console.log);
      return;
    }
    if (!file) {
      cli.outputHelp();
      return;
    }
    run(file, console.log, undefined, options.component, options.annotator ?? []);
  });
```

## Future Extension

When additional reporters (`@makotot/canopy-reporter-json`, etc.) are available, add a `select()` step for reporter selection after annotator selection.
