import { compose, type Annotator } from './annotator.js';
import type { Reporter } from './reporter.js';

export function createPipeline<G>(options: {
  build: () => G;
  annotators: Annotator<G>[];
  reporter: Reporter<G>;
}): void {
  const graph = compose(...options.annotators)(options.build());
  options.reporter(graph);
}
