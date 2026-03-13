#!/usr/bin/env node
import { cac } from 'cac';
import { run } from './run.js';

const cli = cac('canopy');

cli
  .command('<file>', 'Analyze a React component file and output a Mermaid flowchart')
  .option('--component <name>', 'Name of the exported component to analyze')
  .action((file: string, options: { component?: string }) => {
    run(file, console.log, undefined, options.component);
  });

cli.help();
cli.parse();
