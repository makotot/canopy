#!/usr/bin/env node
import { cac } from 'cac';
import { run } from './run.js';

const cli = cac('canopy');

cli
  .command('<file>', 'Analyze a React component file and output a Mermaid flowchart')
  .option('--component <name>', 'Name of the exported component to analyze')
  .option('--annotator <name>', 'Annotator to apply: async, client-boundary (repeatable)', {
    type: [],
  })
  .action((file: string, options: { component?: string; annotator?: string[] }) => {
    run(file, console.log, undefined, options.component, options.annotator ?? []);
  });

cli.help();
cli.parse();
