# Design: `@makotot/canopy-reporter-tree`

- **Date**: 2026-03-25

## Overview

`@makotot/canopy-reporter-tree` renders the annotated `TreeNode` graph as an ASCII tree printed to stdout. It follows the same `createXxxReporter(out: Out): Reporter<TreeNode>` factory pattern as the existing `mermaid` and `json` reporters.

The primary motivation is terminal-first workflows (e.g. Claude Code): the Mermaid reporter requires opening an external viewer, whereas the tree reporter lets the user inspect the component hierarchy without leaving the terminal.

---

## Output Format

### Basic tree

```
App
├── Header
│   └── Nav
├── Main
│   ├── Sidebar
│   └── Content
└── Footer
```

### Conditional rendering

`condition` and `branch` are shown as inline suffixes on the node:

```
Main
├── Dashboard  [? true]
└── NotFound   [? false]
```

```
Toolbar
└── DeleteButton  [&&]
```

### Render props

Nodes passed via JSX props (`props` field in `TreeNode`) are grouped under a labelled pseudo-node:

```
Layout
├── [prop: fallback]
│   └── Spinner
└── Content
```

### Annotator metadata — tags and badges

`meta.tags` and `meta.badge` are appended as inline suffixes on the same line, regardless of how many there are. This differs from the Mermaid reporter which stacks badges vertically inside a node box using `<br/>`; in ASCII tree there is no box concept so a flat single-line representation is more natural.

Context-aware tags (`provides:` / `consumes:`) are included as-is so the provider/consumer relationship can be read directly from the tree:

```
App
├── AuthProvider   [provides:AuthContext]
│   └── UserProfile  [async] [client] [consumes:AuthContext] [◎] [🔄]
└── Footer
```

### Subgraph (`meta.group`)

In the Mermaid reporter, a node with `meta.group` keeps itself outside the subgraph while its children are wrapped in a named visual box. To preserve this distinction in ASCII tree, a virtual intermediate node `(group-name)` is inserted between the parent and its children. This node has no corresponding `TreeNode` — it exists only in the rendered output.

```
Dashboard
└── (client)
    ├── DataFetcher
    └── Chart
```

If the node also has children without a group (not currently produced by any annotator but theoretically possible), ungrouped children are rendered alongside the virtual node as siblings.

### Context cross-links footer

When `meta.crossLinks` is present on any node (set by the context annotator), a "Context Links" section is appended after the tree. This corresponds to the dashed cross-edges rendered in the Mermaid output:

```
App
├── AuthProvider   [provides:AuthContext]
│   └── UserProfile  [consumes:AuthContext] [◎]
└── Footer

Context Links
  AuthContext: AuthProvider → UserProfile
```

---

## Node Label Format

```
<ComponentName>[  <annotation>...]
```

Annotations are appended in this order:

| Source                                    | Format         | Example                          |
| ----------------------------------------- | -------------- | -------------------------------- |
| `condition=ternary` + `branch=consequent` | `[? true]`     | `Dashboard  [? true]`            |
| `condition=ternary` + `branch=alternate`  | `[? false]`    | `NotFound   [? false]`           |
| `condition=logical`                       | `[&&]`         | `DeleteButton  [&&]`             |
| `renderProp=true`                         | `[renderProp]` | `Children  [renderProp]`         |
| `meta.tags`                               | `[tag]` each   | `[async] [provides:AuthContext]` |
| `meta.badge`                              | each emoji     | `[◎]` `[📦]`                     |

`meta.group` is **not** appended to the node label. It is expressed as a virtual `(group-name)` child node wrapping the node's children (see above).

`meta.style` (fill/stroke colours from annotators) is **not rendered** in v0.1 — no ANSI colour support. The semantic information is already conveyed via `meta.tags`.

---

## API

```typescript
export function createTreeReporter(out: Out): Reporter<TreeNode>;
```

Internally delegates to:

```typescript
export function renderTree(tree: TreeNode): string;
```

Both follow the exact same split used by the other reporters (`index.ts` as factory, `render-tree.ts` as rendering logic).

---

## Rendering Algorithm

`renderTree` performs a depth-first traversal. Each recursive call receives a `prefix` string that carries the vertical-bar characters for open ancestor levels.

```
renderTree(node, prefix = '', isLast = true):
  connector = isLast ? '└── ' : '├── '
  line      = (prefix === '' ? '' : prefix + connector) + labelOf(node)

  childPrefix = prefix + (isLast ? '    ' : '│   ')

  group = node.meta?.group
  propEntries = Object.entries(node.props ?? {})

  if group and node.children.length > 0:
    # props and the virtual group node are siblings
    allItems = propEntries.map(wrapProp) + [virtualGroup(group, node.children)]
  else:
    allItems = propEntries.map(wrapProp) + node.children

  for each item (i):
    isLastItem = i === allItems.length - 1
    if item is prop entry [name, nodes]:
      emit childPrefix + connector(isLastItem) + '[prop: ' + name + ']'
      for each propNode (j):
        renderTree(propNode, childPrefix + continuation(isLastItem), j === nodes.length - 1)
    else if item is virtualGroup [name, children]:
      emit childPrefix + connector(isLastItem) + '(' + name + ')'
      groupPrefix = childPrefix + continuation(isLastItem)
      for each child (j):
        renderTree(child, groupPrefix, j === children.length - 1)
    else:
      renderTree(item, childPrefix, isLastItem)

# collect cross-links from all nodes
crossLinks = collectCrossLinks(tree)
if crossLinks.length > 0:
  emit ''
  emit 'Context Links'
  for each { label, providerComponent, consumerComponent }:
    emit '  ' + label + ': ' + providerComponent + ' → ' + consumerComponent
```

Where:

- `connector(isLast)` → `'└── '` if last, `'├── '` otherwise
- `continuation(isLast)` → `'    '` if last, `'│   '` otherwise
- `collectCrossLinks` walks the tree and for each node with `meta.crossLinks`, resolves provider and consumer component names using `meta.linkId` as the join key.

---

## CLI Integration

Add `tree` to the `reporterFactories` record in `packages/cli/src/run.ts`:

```typescript
import { createTreeReporter } from '@makotot/canopy-reporter-tree';

export const reporterFactories: Record<string, ReporterFactory> = {
  mermaid: createMermaidReporter,
  json: createJsonReporter,
  tree: createTreeReporter,
};
```

Usage:

```
canopy src/App.tsx --reporter tree
```

---

## Test Strategy

### Unit tests (`render-tree.test.ts`)

| Case                        | What to assert                                                               |
| --------------------------- | ---------------------------------------------------------------------------- |
| Single root, no children    | `App` with no connectors                                                     |
| Root with one child         | `App\n└── Child`                                                             |
| Root with multiple children | `├──` for non-last, `└──` for last                                           |
| Nested children             | Correct `│   ` continuation vs `    ` termination                            |
| `condition=ternary`         | `[? true]` / `[? false]` suffix                                              |
| `condition=logical`         | `[&&]` suffix                                                                |
| `renderProp=true`           | `[renderProp]` suffix                                                        |
| `meta.group`                | Virtual `(group)` node inserted; parent has no group annotation in its label |
| `meta.group` with props     | Props and virtual group node rendered as siblings                            |
| `meta.tags`                 | Each tag rendered as `[tag]` on the same line                                |
| `meta.badge`                | Each badge rendered inline on the same line                                  |
| Multiple tags and badges    | All on one line, no wrapping                                                 |
| `props` field               | `[prop: name]` pseudo-node with children indented beneath                    |
| `meta.crossLinks`           | "Context Links" section appended after the tree                              |
| `meta.style`                | Not rendered (no output)                                                     |

### Snapshot tests (integration)

```
packages/reporter-tree/src/fixtures/
  basic/
    App.tsx
    expected.txt
  conditional/
    App.tsx
    expected.txt
  render-prop/
    App.tsx
    expected.txt
  annotated/
    App.tsx              # with async + client-boundary annotations applied
    expected.txt         # includes virtual (client) group node
  context/
    App.tsx              # with context annotator applied
    expected.txt         # includes "Context Links" footer
```

---

## Files Changed

### New

| Path                      | Description                                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `packages/reporter-tree/` | New package: `package.json`, `tsconfig.json`, `tsconfig.build.json`, `src/index.ts`, `src/render-tree.ts`, tests, fixtures |

### Modified

| File                        | Change                                                               |
| --------------------------- | -------------------------------------------------------------------- |
| `packages/cli/src/run.ts`   | Import `createTreeReporter`; add `tree` entry to `reporterFactories` |
| `packages/cli/package.json` | Add `@makotot/canopy-reporter-tree` as dependency                    |

---

## Scope (v0.1)

**In scope:**

- ASCII tree with `├──` / `└──` / `│` connectors
- Inline annotations for `condition`, `branch`, `renderProp`, `meta.tags`, `meta.badge` — all on a single line per node
- `props` field rendered as labelled pseudo-nodes
- `meta.group` rendered as a virtual `(group-name)` intermediate node wrapping the node's children
- "Context Links" footer section for `meta.crossLinks`
- `--reporter tree` CLI flag

**Out of scope:**

- ANSI colour output (no `meta.style` rendering)
- Line length truncation or wrapping for heavily annotated nodes
- Interactive folding / navigation
- Depth limiting
