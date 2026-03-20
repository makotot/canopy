import { describe, it, expect } from 'vitest';
import { appendBadge } from './append-badge.js';

describe('appendBadge', () => {
  it.each([
    {
      label: 'appends badge to empty meta',
      meta: undefined,
      badge: '⚡',
      expected: { badge: ['⚡'] },
    },
    {
      label: 'appends badge to meta with no existing badge',
      meta: { async: true },
      badge: '⚡',
      expected: { badge: ['⚡'] },
    },
    {
      label: 'appends badge to meta with existing badge array',
      meta: { badge: ['⚡'] },
      badge: '▶◀',
      expected: { badge: ['⚡', '▶◀'] },
    },
    {
      label: 'appends badge to meta with existing badge array and other fields',
      meta: { badge: ['⚡'], style: { fill: '#fff', stroke: '#000' } },
      badge: '⏳',
      expected: { badge: ['⚡', '⏳'] },
    },
  ])('$label', ({ meta, badge, expected }) => {
    expect(appendBadge(meta, badge)).toEqual(expected);
  });
});
