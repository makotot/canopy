#!/usr/bin/env node
import { cac } from 'cac';
import { run, reporterFactories } from './run.js';
import { runInteractive } from './interactive.js';
import { buildAnnotators } from './annotators.js';

const cli = cac('canopy');

const reporterNames = Object.keys(reporterFactories);

cli
  .command('[file]', 'Analyze a React component file and output a Mermaid flowchart')
  .option('-i, --interactive', 'Launch interactive mode')
  .option('--component <name>', 'Name of the exported component to analyze')
  .option('--annotator <name>', 'Annotator to apply: async, client-boundary (repeatable)', {
    type: [],
  })
  .option('--external-packages <pkgs>', 'Comma-separated package names for the external annotator')
  .option(`--reporter <name>`, `Reporter to use: ${reporterNames.join(', ')} (default: mermaid)`)
  .action(
    async (
      file: string | undefined,
      options: {
        interactive?: boolean;
        component?: string;
        annotator?: string[];
        externalPackages?: string;
        reporter?: string;
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
      const reporterName = options.reporter ?? 'mermaid';
      if (!reporterNames.includes(reporterName)) {
        console.error(`Unknown reporter: ${reporterName}. Available: ${reporterNames.join(', ')}`);
        process.exit(1);
      }
      const factories = buildAnnotators((options.annotator ?? []).filter(Boolean), {
        externalPackages: options.externalPackages,
      });
      run(
        file,
        console.log,
        undefined,
        options.component,
        factories,
        reporterFactories[reporterName],
      );
    },
  );

cli.help();
cli.parse();
