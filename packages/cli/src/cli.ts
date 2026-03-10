import { cac } from 'cac';
import { run } from './run.js';

const cli = cac('canopy');

cli
  .command('<file>', 'Analyze a React component file and output a Mermaid flowchart')
  .action((file: string) => {
    run(file, console.log);
  });

cli.help();
cli.parse();
