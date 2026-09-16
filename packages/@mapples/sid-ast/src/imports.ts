// Surgical import maintenance — used after patching a Mapplet so that
// newly-inserted elements are actually imported. Pure: string in, string out.
// Only ADDS imports; user imports are never removed or reordered.

import ts from 'typescript';

import { DEFAULT_PRIMITIVE_MODULES } from './parse.js';

export interface ImportNeed {
  module: string;
  /** Named exports to ensure (localName === exportName). */
  named?: string[];
  /** Default import to ensure under this local name. */
  defaultName?: string;
}

export function upsertImports(source: string, needs: ImportNeed[]): string {
  if (needs.length === 0) return source;
  const sf = ts.createSourceFile(
    'f.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  // What the file already binds, by local name (any module counts — never
  // shadow an existing binding).
  const bound = new Set<string>();
  const byModule = new Map<string, ts.ImportDeclaration>();
  let firstImportStart = -1;
  let lastImportEnd = 0;
  for (const stmt of sf.statements) {
    if (
      !ts.isImportDeclaration(stmt) ||
      !ts.isStringLiteral(stmt.moduleSpecifier)
    )
      continue;
    if (firstImportStart === -1) firstImportStart = stmt.getStart(sf);
    lastImportEnd = stmt.getEnd();
    byModule.set(stmt.moduleSpecifier.text, stmt);
    const clause = stmt.importClause;
    if (!clause) continue;
    if (clause.name) bound.add(clause.name.text);
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const el of clause.namedBindings.elements) bound.add(el.name.text);
    }
  }

  const edits: { start: number; end: number; replacement: string }[] = [];
  /** New primitive-module lines lead the block, the way generated files read. */
  const primitiveLines: string[] = [];
  const newLines: string[] = [];
  const primitives = new Set<string>(DEFAULT_PRIMITIVE_MODULES);

  for (const need of needs) {
    const missingNamed = (need.named ?? []).filter((n) => !bound.has(n));
    const needsDefault =
      need.defaultName !== undefined && !bound.has(need.defaultName);
    if (missingNamed.length === 0 && !needsDefault) continue;

    const existing = byModule.get(need.module);
    if (
      existing?.importClause?.namedBindings &&
      ts.isNamedImports(existing.importClause.namedBindings) &&
      missingNamed.length > 0 &&
      !needsDefault
    ) {
      // Extend the existing named list: `{ A, B }` -> `{ A, B, C }`.
      const bindings = existing.importClause.namedBindings;
      const current = bindings.elements.map((el) => el.getText(sf));
      const merged = [...current, ...missingNamed].sort((a, b) =>
        a < b ? -1 : 1,
      );
      edits.push({
        start: bindings.getStart(sf),
        end: bindings.getEnd(),
        replacement: `{ ${merged.join(', ')} }`,
      });
      for (const n of missingNamed) bound.add(n);
      continue;
    }

    const pieces: string[] = [];
    if (needsDefault) pieces.push(need.defaultName!);
    if (missingNamed.length > 0)
      pieces.push(`{ ${missingNamed.sort().join(', ')} }`);
    (primitives.has(need.module) ? primitiveLines : newLines).push(
      `import ${pieces.join(', ')} from '${need.module}';`,
    );
    if (need.defaultName) bound.add(need.defaultName);
    for (const n of missingNamed) bound.add(n);
  }

  edits.sort((a, b) => b.start - a.start);
  let out = source;
  for (const e of edits)
    out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  if (lastImportEnd > 0) {
    // Later edits first, so earlier offsets stay valid.
    if (newLines.length > 0) {
      out =
        out.slice(0, lastImportEnd) +
        '\n' +
        newLines.join('\n') +
        out.slice(lastImportEnd);
    }
    if (primitiveLines.length > 0) {
      out =
        out.slice(0, firstImportStart) +
        primitiveLines.join('\n') +
        '\n' +
        out.slice(firstImportStart);
    }
  } else if (primitiveLines.length > 0 || newLines.length > 0) {
    // No imports left: the block goes where a generated file keeps it — after
    // the leading comments (route marker, header), one blank line on each
    // side — so a file whose only damage was a stripped import heals back to
    // its original bytes.
    const firstStart = sf.statements[0]?.getStart(sf) ?? out.length;
    const leading = out.slice(0, firstStart).replace(/\n*$/, '');
    const rest = out.slice(firstStart);
    const block = [...primitiveLines, ...newLines].join('\n');
    out =
      leading === ''
        ? `${block}\n\n${rest}`
        : `${leading}\n\n${block}\n\n${rest}`;
  }
  return out;
}
