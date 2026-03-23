import { type Annotator, type TreeNode } from '@makotot/canopy-core';
import { createAsyncAnnotator } from '@makotot/canopy-annotator-async';
import { createClientBoundaryAnnotator } from '@makotot/canopy-annotator-client-boundary';
import { createSuspenseAnnotator } from '@makotot/canopy-annotator-suspense';
import { createContextAnnotator } from '@makotot/canopy-annotator-context';
import {
  createSemanticAnnotator,
  requiredAttrs as semanticRequiredAttrs,
} from '@makotot/canopy-annotator-semantic';
import { type Project } from 'ts-morph';

type AnnotatorEntry = {
  create: (sourceFilePath: string, project: Project) => Annotator<TreeNode>;
  requiredAttrs?: string[];
};

export const ANNOTATORS: Record<string, AnnotatorEntry> = {
  async: { create: createAsyncAnnotator },
  'client-boundary': { create: createClientBoundaryAnnotator },
  suspense: { create: createSuspenseAnnotator },
  context: { create: createContextAnnotator },
  semantic: { create: () => createSemanticAnnotator(), requiredAttrs: semanticRequiredAttrs },
};
