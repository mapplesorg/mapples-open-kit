// Literal-analyzable `export const NAME = {...}` extraction — used for
// mapples/theme.ts (style entity <-> code). Pure: string in, JSON out.

import ts from 'typescript';

export interface ExportedObjects {
  values: Map<string, unknown>;
  /** exported consts whose initializer was NOT a literal (kept out of `values`) */
  nonLiteral: string[];
}

const NON_LITERAL = Symbol('non-literal');

function evalLiteral(expr: ts.Expression): unknown | typeof NON_LITERAL {
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr))
    return expr.text;
  if (ts.isNumericLiteral(expr)) return Number(expr.text);
  if (expr.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (expr.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (expr.kind === ts.SyntaxKind.NullKeyword) return null;
  if (
    ts.isPrefixUnaryExpression(expr) &&
    expr.operator === ts.SyntaxKind.MinusToken
  ) {
    const inner = evalLiteral(expr.operand);
    return typeof inner === 'number' ? -inner : NON_LITERAL;
  }
  if (ts.isParenthesizedExpression(expr)) return evalLiteral(expr.expression);
  if (ts.isAsExpression(expr) || ts.isSatisfiesExpression(expr))
    return evalLiteral(expr.expression);
  if (ts.isArrayLiteralExpression(expr)) {
    const out: unknown[] = [];
    for (const el of expr.elements) {
      const v = evalLiteral(el);
      if (v === NON_LITERAL) return NON_LITERAL;
      out.push(v);
    }
    return out;
  }
  if (ts.isObjectLiteralExpression(expr)) {
    const out: Record<string, unknown> = {};
    for (const prop of expr.properties) {
      if (!ts.isPropertyAssignment(prop)) return NON_LITERAL;
      if (!ts.isIdentifier(prop.name) && !ts.isStringLiteral(prop.name))
        return NON_LITERAL;
      const v = evalLiteral(prop.initializer);
      if (v === NON_LITERAL) return NON_LITERAL;
      out[prop.name.text] = v;
    }
    return out;
  }
  return NON_LITERAL;
}

export function extractExportedObjects(source: string): ExportedObjects {
  const sf = ts.createSourceFile(
    'file.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const values = new Map<string, unknown>();
  const nonLiteral: string[] = [];
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    const isExported =
      stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ??
      false;
    if (!isExported) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
      const v = evalLiteral(decl.initializer);
      if (v === NON_LITERAL) nonLiteral.push(decl.name.text);
      else values.set(decl.name.text, v);
    }
  }
  return { values, nonLiteral };
}
