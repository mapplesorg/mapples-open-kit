# @mapples/sid-ast

Pure TSX ↔ RenderDom library for `$sid`-tagged JSX. **No I/O** — strings in, JSON out; no fs, no
network, and no TypeScript AST types escape the public API.

| Export                           | What it does                                                                                                                                                                                                                                                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extract(source)`                | TSX → RenderDom: every `$sid` element becomes a node; everything else is invisible. A `styles.x` reference is read through the file's `StyleSheet.create` / `Styler.create` / plain-object dictionary. Emits `NON_LITERAL_PROP` / `DUPLICATE_SID` / `UNKNOWN_ELEMENT_WITH_SID` warnings — never drops silently. |
| `printNode(dom, indent?, opts?)` | RenderDom → deterministic JSX (`$sid` first, sorted props, single-quoted strings). `opts.styleRef` prints a `styled` key as an expression (`styles.card`) for callers that hoist styles.                                                                                                                        |
| `patch(source, edits)`           | Surgical edits (`setProps`, `removeNode`, `insertChild`, `moveChild`, `replaceSubtree`) — reprints only the touched `$sid` regions; all user text is preserved byte-for-byte. A `styled` value read through a dictionary entry is written back into that entry when the element is its only reader.             |
| `codemodAdopt(source, opts)`     | Adoption codemod: swaps supported RN primitives (mapped by export name), translates `style` and friends into `styled` (single `styles.x` references kept, arrays merged), mints `c_` sids, wraps unsupported components as Custom, and tags imports `opts.isLinked` claims as linked component instances.       |
| `scanComponents(source)`         | Finds exported components / existing `$sid`s for the adoption scan.                                                                                                                                                                                                                                             |
| `extractExportedObjects(source)` | Literal `export const` extraction (used for `mapples/theme.ts`).                                                                                                                                                                                                                                                |

**The round-trip law** (tested): `extract(emit(dom)) ≡ dom` for every fixture, and a no-op patch is
byte-identical.

> **Workspace mirror.** The canonical source lives in the `mapplesorg/mapples` repo
> (`packages/sid-ast`); this copy exists for in-monorepo development of the Creator's
> code editor and is never released from here. Sync changes there first.
> Expected delta from the canonical copy: relative imports drop their `.js` extension (Metro resolves the mirror from `src`).
