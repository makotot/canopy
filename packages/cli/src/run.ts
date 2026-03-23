import { analyzeRenderTree, createPipeline, type Out } from '@makotot/canopy-core';
import { createMermaidReporter } from '@makotot/canopy-reporter-mermaid';
import { type Project } from 'ts-morph';
import { type AnnotatorFactory } from './annotators.js';

export function run(
  filePath: string,
  out: Out,
  project?: Project,
  componentName?: string,
  annotatorFactories: AnnotatorFactory[] = [],
): void {
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
    annotators: annotatorFactories.map((factory) => factory(sourceFilePath, resolvedProject)),
    reporter: createMermaidReporter(out),
  });
}
