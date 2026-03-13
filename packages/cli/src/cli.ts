#!/usr/bin/env node
import { cac } from 'cac';
import { run } from './run.js';
import { runInteractive } from './interactive.js';

const cli = cac('canopy');

cli
  .command('[file]', 'Analyze a React component file and output a Mermaid flowchart')
  .option('-i, --interactive', 'Launch interactive mode')
  .option('--component <name>', 'Name of the exported component to analyze')
  .option('--annotator <name>', 'Annotator to apply: async, client-boundary (repeatable)', {
    type: [],
  })
  .action(
    async (
      file: string | undefined,
      options: { interactive?: boolean; component?: string; annotator?: string[] },
    ) => {
      if (options.interactive) {
        await runInteractive(console.log);
        return;
      }
      if (!file) {
        cli.outputHelp();
        return;
      }
      run(file, console.log, undefined, options.component, options.annotator ?? []);
    },
  );

cli.help();
cli.parse();
