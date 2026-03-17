import { type Annotator, type TreeNode } from '@makotot/canopy-core';
import { createAsyncAnnotator } from '@makotot/canopy-annotator-async';
import { createClientBoundaryAnnotator } from '@makotot/canopy-annotator-client-boundary';
import { createSuspenseAnnotator } from '@makotot/canopy-annotator-suspense';
import { createContextAnnotator } from '@makotot/canopy-annotator-context';
import { type Project } from 'ts-morph';

export const ANNOTATORS: Record<
  string,
  (sourceFilePath: string, project: Project) => Annotator<TreeNode>
> = {
  async: createAsyncAnnotator,
  'client-boundary': createClientBoundaryAnnotator,
  suspense: createSuspenseAnnotator,
  context: createContextAnnotator,
};
