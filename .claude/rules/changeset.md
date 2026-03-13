# Changeset Rules

## Format

Changeset files live in `.changeset/*.md` and follow this structure:

```markdown
---
"@makotot/canopy-foo": minor
"@makotot/canopy-bar": patch
---

One-paragraph summary of what changed and why.
```

## Bump Type

All packages are currently `0.x.x`. Do **not** use `major` — it would bump to `1.0.0`.

| Change type | Bump |
|---|---|
| Breaking change | `minor` |
| New feature / new package | `minor` |
| Bug fix / additive patch | `patch` |

## Scope

Only list packages whose published output changes. Do not include:

- Root config files (`vitest.config.ts`, `pnpm-workspace.yaml`, etc.)
- Internal dev tooling changes with no impact on consumers

## Summary Content

- One paragraph, plain English.
- Lead with what changed from a **consumer's perspective**.
- Call out breaking changes explicitly (e.g. "**Breaking:** ...").
- No need to list every file touched — focus on the observable behavior change.
