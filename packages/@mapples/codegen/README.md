# @mapples/codegen

Pure RenderDom → TSX generation for Mapples pages and components — the half of
the `mapples` CLI's code generation that has no I/O, so the Creator's in-app
code editor and the CLI print the same file from the same document.

- `emitPage` / `emitComponent` / `emitTree`: a whole file (unformatted — run
  Prettier yourself; the CLI does, with the project's own config).
- `collectImports` / `printImports` / `importNeedsFor`: the import block.
- `hoistStyles`: every `styled` object becomes a `Styler.create` entry.
- `instanceLinker`: file language (`Custom` + relative import) ↔ canvas
  language (`ComponentInstance`) for linked Creator components, over an
  injected module resolver (`posixResolver` for repo-relative paths).
- Route markers: `ROUTE_MARKER`, `withRouteMarker`, `withoutRouteMarker`.

Depends only on `@mapples/sid-ast`.

> **Workspace mirror.** The canonical source lives in the `mapplesorg/mapples` repo
> (`packages/codegen`); this copy exists for in-monorepo development of the Creator's
> code editor and is never released from here. Sync changes there first.
> Expected delta from the canonical copy: relative imports drop their `.js` extension (Metro resolves the mirror from `src`).
