import { intro, text, multiselect, outro, isCancel, cancel } from '@clack/prompts';
import { type Out } from '@makotot/canopy-core';
import { ANNOTATORS } from './annotators.js';
import { run } from './run.js';

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
    options: Object.keys(ANNOTATORS).map((name) => ({ value: name, label: name })),
    required: false,
  });
  if (isCancel(selectedAnnotators)) {
    cancel('Cancelled');
    process.exit(0);
  }

  outro('Running…');

  run(
    filePath,
    out,
    undefined,
    componentName.trim() !== '' ? componentName : undefined,
    selectedAnnotators as string[],
  );
}
