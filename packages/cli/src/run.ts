import { analyzeRenderTree, createPipeline, type Out } from '@makotot/canopy-core';
import { createMermaidReporter } from '@makotot/canopy-reporter-mermaid';
import { type Project } from 'ts-morph';
import { ANNOTATORS } from './annotators.js';

export function run(
  filePath: string,
  out: Out,
  project?: Project,
  componentName?: string,
  annotatorNames: string[] = [],
): void {
  for (const name of annotatorNames) {
    if (!(name in ANNOTATORS)) {
      throw new Error(`Unknown annotator: ${name}`);
    }
  }
  const {
    tree,
    project: resolvedProject,
    sourceFilePath,
  } = analyzeRenderTree({
    filePath,
    ...(componentName !== undefined && { componentName }),
    ...(project !== undefined && { project }),
  });
  createPipeline({
    build: () => tree,
    annotators: annotatorNames.map((name) => ANNOTATORS[name]!(sourceFilePath, resolvedProject)),
    reporter: createMermaidReporter(out),
  });
}
