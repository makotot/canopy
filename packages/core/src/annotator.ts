export type Annotator<G> = (graph: G) => G;

export function compose<G>(...annotators: Annotator<G>[]): Annotator<G> {
  return (graph) => annotators.reduce((g, annotate) => annotate(g), graph);
}
