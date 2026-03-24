import { intro, text, multiselect, select, outro, isCancel, cancel } from '@clack/prompts';
import { type Out } from '@makotot/canopy-core';
import { ANNOTATOR_BUILDERS, buildAnnotators } from './annotators.js';
import { run, reporterFactories } from './run.js';

export async function runInteractive(out: Out): Promise<void> {
  intro('canopy');

  const filePath = await text({
    message: 'Entry point file',
    validate: (value) =>
      value === undefined || value.trim() === '' ? 'File path is required' : undefined,
  });
  if (isCancel(filePath)) {
    cancel('Cancelled');
    process.exit(0);
  }

  const componentName = await text({
    message: 'Component name (optional — leave blank to use default export)',
  });
  if (isCancel(componentName)) {
    cancel('Cancelled');
    process.exit(0);
  }

  const selectedAnnotators = await multiselect({
    message: 'Select annotators',
    options: Object.keys(ANNOTATOR_BUILDERS).map((name) => ({ value: name, label: name })),
    required: false,
  });
  if (isCancel(selectedAnnotators)) {
    cancel('Cancelled');
    process.exit(0);
  }

  let externalPackages: string | undefined;
  if ((selectedAnnotators as string[]).includes('external')) {
    const input = await text({
      message: 'Package names for external annotator (comma-separated)',
      validate: (value) =>
        value === undefined || value.trim() === ''
          ? 'At least one package name is required'
          : undefined,
    });
    if (isCancel(input)) {
      cancel('Cancelled');
      process.exit(0);
    }
    externalPackages = input;
  }

  const selectedReporter = await select({
    message: 'Select reporter',
    options: Object.keys(reporterFactories).map((name) => ({ value: name, label: name })),
  });
  if (isCancel(selectedReporter)) {
    cancel('Cancelled');
    process.exit(0);
  }

  outro('Running…');

  run(
    filePath,
    out,
    undefined,
    componentName.trim() !== '' ? componentName : undefined,
    buildAnnotators(selectedAnnotators as string[], { externalPackages }),
    reporterFactories[selectedReporter as string],
  );
}
