import {
  analyzeRenderTree,
  createPipeline,
  type Annotator,
  type Out,
  type TreeNode,
} from '@makotot/canopy-core';
import { createAsyncAnnotator } from '@makotot/canopy-annotator-async';
import { createClientBoundaryAnnotator } from '@makotot/canopy-annotator-client-boundary';
import { createMermaidReporter } from '@makotot/canopy-reporter-mermaid';
import { type Project } from 'ts-morph';

const ANNOTATORS: Record<
  string,
  (sourceFilePath: string, project: Project) => Annotator<TreeNode>
> = {
  async: createAsyncAnnotator,
  'client-boundary': createClientBoundaryAnnotator,
};

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
