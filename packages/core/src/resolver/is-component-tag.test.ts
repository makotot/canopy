import { describe, it, expect } from 'vitest';
import { isComponentTag } from './is-component-tag.js';

describe('isComponentTag', () => {
  it.each([
    { name: 'Header', expected: true },
    { name: 'UserCard', expected: true },
    { name: 'div', expected: false },
    { name: 'main', expected: false },
    { name: 'span', expected: false },
  ])('$name → $expected', ({ name, expected }) => {
    expect(isComponentTag(name)).toBe(expected);
  });
});
