import {
  analyzeRenderTree,
  createPipeline,
  type Out,
} from '@makotot/canopy-core';
import { createAsyncAnnotator } from '@makotot/canopy-annotator-async';
import { createMermaidReporter } from '@makotot/canopy-reporter-mermaid';
import { type Project } from 'ts-morph';

export function run(filePath: string, out: Out, project?: Project): void {
  const { tree, project: resolvedProject, sourceFilePath } = analyzeRenderTree(filePath, project);
  createPipeline({
    build: () => tree,
    annotators: [createAsyncAnnotator(sourceFilePath, resolvedProject)],
    reporter: createMermaidReporter(out),
  });
}
