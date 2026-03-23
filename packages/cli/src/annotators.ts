import { type Annotator, type TreeNode } from '@makotot/canopy-core';
import { createAsyncAnnotator } from '@makotot/canopy-annotator-async';
import { createClientBoundaryAnnotator } from '@makotot/canopy-annotator-client-boundary';
import { createSuspenseAnnotator } from '@makotot/canopy-annotator-suspense';
import { createContextAnnotator } from '@makotot/canopy-annotator-context';
import { createExternalAnnotator } from '@makotot/canopy-annotator-external';
import { type Project } from 'ts-morph';

export type AnnotatorFactory = (sourceFilePath: string, project: Project) => Annotator<TreeNode>;

export interface BuildAnnotatorsOptions {
  externalPackages?: string | undefined;
}

type AnnotatorBuilder = (options: BuildAnnotatorsOptions) => AnnotatorFactory;

export const ANNOTATOR_BUILDERS: Record<string, AnnotatorBuilder> = {
  async: () => createAsyncAnnotator,
  'client-boundary': () => createClientBoundaryAnnotator,
  suspense: () => createSuspenseAnnotator,
  context: () => createContextAnnotator,
  external: (options) => {
    const packages = (options.externalPackages ?? '').split(',').filter(Boolean);
    return (sf, p) => createExternalAnnotator(sf, p, { packages });
  },
};

export function buildAnnotators(
  names: string[],
  options: BuildAnnotatorsOptions = {},
): AnnotatorFactory[] {
  return names.map((name) => {
    const builder = ANNOTATOR_BUILDERS[name];
    if (!builder) {
      throw new Error(`Unknown annotator: ${name}`);
    }
    return builder(options);
  });
}
