import { describe, it, expect } from 'vitest';
import { appendTag } from './append-tag.js';

describe('appendTag', () => {
  it.each([
    {
      label: 'appends tag to empty meta',
      meta: undefined,
      tag: 'async',
      expected: { tags: ['async'] },
    },
    {
      label: 'appends tag to meta with no existing tags',
      meta: { badge: ['⚡'] },
      tag: 'async',
      expected: { tags: ['async'] },
    },
    {
      label: 'appends tag to meta with existing tags',
      meta: { tags: ['async'] },
      tag: 'suspense',
      expected: { tags: ['async', 'suspense'] },
    },
    {
      label: 'appends tag to meta with existing tags and other fields',
      meta: { tags: ['async'], style: { fill: '#fff', stroke: '#000' } },
      tag: 'client',
      expected: { tags: ['async', 'client'] },
    },
  ])('$label', ({ meta, tag, expected }) => {
    expect(appendTag(meta, tag)).toEqual(expected);
  });
});
