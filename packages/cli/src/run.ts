import { analyzeRenderTree, createPipeline, type Out } from '@makotot/canopy-core';
import { createMermaidReporter } from '@makotot/canopy-reporter-mermaid';
import { type Project } from 'ts-morph';
import { ANNOTATORS, type AnnotatorName } from './annotators.js';

function isAnnotatorName(name: string): name is AnnotatorName {
  return name in ANNOTATORS;
}

export function run(
  filePath: string,
  out: Out,
  project?: Project,
  componentName?: string,
  annotatorNames: string[] = [],
): void {
  const validatedNames: AnnotatorName[] = [];
  for (const name of annotatorNames) {
    if (!isAnnotatorName(name)) {
      throw new Error(`Unknown annotator: ${name}`);
    }
    validatedNames.push(name);
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
    annotators: validatedNames.map((name) => ANNOTATORS[name](sourceFilePath, resolvedProject)),
    reporter: createMermaidReporter(out),
  });
}
