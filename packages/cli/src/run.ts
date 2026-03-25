import { analyzeRenderTree, createPipeline, type Out } from '@makotot/canopy-core';
import { createMermaidReporter } from '@makotot/canopy-reporter-mermaid';
import { createJsonReporter } from '@makotot/canopy-reporter-json';
import { createTreeReporter } from '@makotot/canopy-reporter-tree';
import { type Project } from 'ts-morph';
import { type AnnotatorFactory } from './annotators.js';

export type ReporterFactory = (out: Out) => ReturnType<typeof createMermaidReporter>;

export const reporterFactories: Record<string, ReporterFactory> = {
  mermaid: createMermaidReporter,
  json: createJsonReporter,
  tree: createTreeReporter,
};

export function run(
  filePath: string,
  out: Out,
  project?: Project,
  componentName?: string,
  annotatorFactories: AnnotatorFactory[] = [],
  reporterFactory: ReporterFactory = createMermaidReporter,
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
    reporter: reporterFactory(out),
  });
}
