---
paths: **/*.test.ts
---

# Testing Rules

- Prefer parameterized tests (`it.each`) over duplicated `it` blocks.
- Avoid `!` (non-null assertion) and null checks in tests. Use throwing accessors (e.g. `getOrThrow()`, `getInitializerOrThrow()`) to surface bugs as errors rather than silencing types or branching test logic.
