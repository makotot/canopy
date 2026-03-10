import { describe, it, expect } from 'vitest';
import { compose } from './annotator.js';

describe('compose', () => {
  it.each([
    {
      label: 'returns graph unchanged for empty annotators',
      annotators: [] as Array<(g: { value: number }) => { value: number }>,
      input: { value: 1 },
      expected: { value: 1 },
    },
    {
      label: 'applies single annotator',
      annotators: [(g: { value: number }) => ({ value: g.value + 1 })],
      input: { value: 0 },
      expected: { value: 1 },
    },
    {
      label: 'composes multiple annotators left to right',
      annotators: [
        (g: { value: number }) => ({ value: g.value + 1 }),
        (g: { value: number }) => ({ value: g.value * 10 }),
      ],
      input: { value: 0 },
      expected: { value: 10 },
    },
  ])('$label', ({ annotators, input, expected }) => {
    expect(compose(...annotators)(input)).toEqual(expected);
  });
});
