// Style dictionaries: the module-level `const styles = StyleSheet.create({…})`,
// `Styler.create({…})` or plain `{…}` a file keeps its styles in, and the
// `styles.card` references that point into them. Extraction reads a reference
// as the literal it names; the patcher writes a Creator edit back into the
// entry; the codemod keeps a developer's references instead of inlining them.
// Internal: touches TypeScript AST types.

import ts from 'typescript';

import { evalLiteral, NON_LITERAL } from './literal.js';
import type { Span } from './types.js';

export interface StyleDictEntry {
  key: string;
  /** The entry's object literal — what a Creator edit replaces. */
  node: ts.ObjectLiteralExpression;
  span: Span;
}

export interface StyleDict {
  name: string;
  statement: ts.VariableStatement;
  object: ts.ObjectLiteralExpression;
  /** `StyleSheet` / `Styler` in `X.create({…})`; null for a plain object. */
  creator: ts.Identifier | null;
  entries: Map<string, StyleDictEntry>;
}

/** A resolved `styles.card`: the dictionary, the key, and where it sits in the value it was read into. */
export interface StyleRef {
  dict: string;
  key: string;
  path: string[];
}

/** Top-level style dictionaries, keyed by identifier. */
export function collectStyleDicts(sf: ts.SourceFile): Map<string, StyleDict> {
  const dicts = new Map<string, StyleDict>();
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    if (stmt.declarationList.declarations.length !== 1) continue;
    const decl = stmt.declarationList.declarations[0]!;
    if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
    let object: ts.ObjectLiteralExpression | null = null;
    let creator: ts.Identifier | null = null;
    const init = decl.initializer;
    if (ts.isObjectLiteralExpression(init)) {
      object = init;
    } else if (
      ts.isCallExpression(init) &&
      ts.isPropertyAccessExpression(init.expression) &&
      ts.isIdentifier(init.expression.expression) &&
      init.expression.name.text === 'create' &&
      init.arguments.length === 1 &&
      ts.isObjectLiteralExpression(init.arguments[0]!)
    ) {
      object = init.arguments[0] as ts.ObjectLiteralExpression;
      creator = init.expression.expression;
    }
    if (!object) continue;
    const entries = new Map<string, StyleDictEntry>();
    for (const p of object.properties) {
      if (!ts.isPropertyAssignment(p)) continue;
      if (!(ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) continue;
      if (!ts.isObjectLiteralExpression(p.initializer)) continue;
      entries.set(p.name.text, {
        key: p.name.text,
        node: p.initializer,
        span: {
          start: p.initializer.getStart(sf),
          end: p.initializer.getEnd(),
        },
      });
    }
    dicts.set(decl.name.text, {
      name: decl.name.text,
      statement: stmt,
      object,
      creator,
      entries,
    });
  }
  return dicts;
}

/** `styles.card` / `styles['card']` -> its dictionary entry, when the file declares one. */
export function styleRefOf(
  expr: ts.Expression,
  dicts: Map<string, StyleDict>,
): { dict: StyleDict; entry: StyleDictEntry } | null {
  let dictName: string | null = null;
  let key: string | null = null;
  if (ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.expression)) {
    dictName = expr.expression.text;
    key = expr.name.text;
  } else if (
    ts.isElementAccessExpression(expr) &&
    ts.isIdentifier(expr.expression) &&
    ts.isStringLiteral(expr.argumentExpression)
  ) {
    dictName = expr.expression.text;
    key = expr.argumentExpression.text;
  }
  if (dictName === null || key === null) return null;
  const dict = dicts.get(dictName);
  const entry = dict?.entries.get(key);
  return dict && entry ? { dict, entry } : null;
}

/** The literal a dictionary entry holds, or NON_LITERAL when it is not one. */
export function entryLiteral(
  entry: StyleDictEntry,
): unknown | typeof NON_LITERAL {
  return evalLiteral(entry.node);
}

/**
 * How many places in the file read `dict.key` — the whole file, dictionary
 * excluded. One means a Creator edit can rewrite the entry itself; more means
 * the entry is shared.
 */
export function countStyleRefs(
  sf: ts.SourceFile,
  dict: StyleDict,
  key: string,
): number {
  let count = 0;
  const walk = (n: ts.Node): void => {
    if (n === dict.statement) return;
    const ref = styleRefOf(n as ts.Expression, new Map([[dict.name, dict]]));
    if (ref && ref.entry.key === key) count += 1;
    ts.forEachChild(n, walk);
  };
  walk(sf);
  return count;
}

export { NON_LITERAL };
