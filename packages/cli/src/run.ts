import {
  analyzeRenderTree,
  createPipeline,
  type Out,
} from '@makotot/canopy-core';
import { createAsyncAnnotator } from '@makotot/canopy-annotator-async';
import { createMermaidReporter } from '@makotot/canopy-reporter-mermaid';

export function run(filePath: string, out: Out): void {
  const { tree, project, sourceFilePath } = analyzeRenderTree(filePath);
  createPipeline({
    build: () => tree,
    annotators: [createAsyncAnnotator(sourceFilePath, project)],
    reporter: createMermaidReporter(out),
  });
}
