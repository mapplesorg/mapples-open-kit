# @mapples/textpatch

Unified-diff hunks for Mapples Source text (RFC-0001 A13). A page's or
component's TSX moves between the Creator, the `mapples` CLI and the server
as the hunk section of a unified diff — `+`/`-` lines against the text whose
hash is `base` — never as the whole file.

- `makeHunks(old, new)`: the hunks turning `old` into `new` (`''` when equal).
- `applyHunks(text, hunks)`: exact apply — no fuzz, no offset, no whitespace
  normalization; throws `TextPatchError` (`SOURCE_PATCH_INVALID`).
- `merge3(base, ours, theirs)`: line-level 3-way merge (diff3 over jsdiff);
  identical edits on both sides are not conflicts, touching hunks are (as in
  git); never writes conflict markers.
- `textHash(text)`: the `b3:` content hash of the text (canonical JSON string).
- `parseHunks`, `countLines`, `mapAddedLines`, `splitLines`, `joinLines`.

The apply rules are normative and mirrored line for line by the server's
`api/canvas/textpatch.py`; `textpatch_vectors.json` pins both. Hunks are not
canonical (jsdiff and difflib may group an edit differently), so they are
only ever applied, never hashed or compared.

Line rule: split on `\n` only — `\r`, `\f` and ` ` are content, so CRLF
files round-trip byte-exact.
