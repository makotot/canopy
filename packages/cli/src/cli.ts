#!/usr/bin/env node
import { cac } from 'cac';
import { run } from './run.js';
import { runInteractive } from './interactive.js';
import { buildAnnotators } from './annotators.js';

const cli = cac('canopy');

cli
  .command('[file]', 'Analyze a React component file and output a Mermaid flowchart')
  .option('-i, --interactive', 'Launch interactive mode')
  .option('--component <name>', 'Name of the exported component to analyze')
  .option('--annotator <name>', 'Annotator to apply: async, client-boundary (repeatable)', {
    type: [],
  })
  .option('--external-packages <pkgs>', 'Comma-separated package names for the external annotator')
  .action(
    async (
      file: string | undefined,
      options: {
        interactive?: boolean;
        component?: string;
        annotator?: string[];
        externalPackages?: string;
      },
    ) => {
      if (options.interactive) {
        await runInteractive(console.log);
        return;
      }
      if (!file) {
        cli.outputHelp();
        return;
      }
      const factories = buildAnnotators(options.annotator ?? [], {
        externalPackages: options.externalPackages,
      });
      run(file, console.log, undefined, options.component, factories);
    },
  );

cli.help();
cli.parse();
