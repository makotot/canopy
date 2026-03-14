import { type Annotator, type TreeNode } from '@makotot/canopy-core';
import { createAsyncAnnotator } from '@makotot/canopy-annotator-async';
import { createClientBoundaryAnnotator } from '@makotot/canopy-annotator-client-boundary';
import { type Project } from 'ts-morph';

export const ANNOTATORS = {
  async: createAsyncAnnotator,
  'client-boundary': createClientBoundaryAnnotator,
} satisfies Record<string, (sourceFilePath: string, project: Project) => Annotator<TreeNode>>;

export type AnnotatorName = keyof typeof ANNOTATORS;
