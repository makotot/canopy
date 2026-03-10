import { describe, it, expect, vi } from 'vitest';
import { createPipeline } from './pipeline.js';

describe('createPipeline', () => {
  it.each([
    {
      label: 'calls build once',
      setup: () => {
        const build = vi.fn(() => ({ value: 0 }));
        createPipeline({ build, annotators: [], reporter: () => {} });
        return { build };
      },
      assert: ({ build }: { build: ReturnType<typeof vi.fn> }) => {
        expect(build).toHaveBeenCalledTimes(1);
      },
    },
    {
      label: 'applies annotators in order',
      setup: () => {
        const order: number[] = [];
        const annotators = [
          (g: { value: number }) => { order.push(1); return { value: g.value + 1 }; },
          (g: { value: number }) => { order.push(2); return { value: g.value + 10 }; },
        ];
        createPipeline({ build: () => ({ value: 0 }), annotators, reporter: () => {} });
        return { order };
      },
      assert: ({ order }: { order: number[] }) => {
        expect(order).toEqual([1, 2]);
      },
    },
    {
      label: 'passes annotated graph to reporter',
      setup: () => {
        const reported: { value: number }[] = [];
        const annotators = [(g: { value: number }) => ({ value: g.value + 5 })];
        createPipeline({
          build: () => ({ value: 0 }),
          annotators,
          reporter: (g) => reported.push(g),
        });
        return { reported };
      },
      assert: ({ reported }: { reported: { value: number }[] }) => {
        expect(reported).toEqual([{ value: 5 }]);
      },
    },
    {
      label: 'works with no annotators',
      setup: () => {
        const reported: { value: number }[] = [];
        createPipeline({
          build: () => ({ value: 42 }),
          annotators: [],
          reporter: (g) => reported.push(g),
        });
        return { reported };
      },
      assert: ({ reported }: { reported: { value: number }[] }) => {
        expect(reported).toEqual([{ value: 42 }]);
      },
    },
  ])('$label', ({ setup, assert }) => {
    assert(setup() as never);
  });
});
