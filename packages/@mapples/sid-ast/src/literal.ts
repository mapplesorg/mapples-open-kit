// Static evaluation of JSON-like expressions. Internal: touches TypeScript AST
// types, so nothing outside sid-ast may import from here.

import ts from 'typescript';

export const NON_LITERAL = Symbol('non-literal');

/**
 * Consulted for an expression `evalLiteral` cannot read as a literal — a
 * `styles.card` reference, say. Returns the value it stands for, or
 * `undefined` to leave the expression non-literal. `path` is where the
 * expression sits inside the value being evaluated (`['style']` for the
 * `style` key of a `styled` object).
 */
export type LiteralResolver = (
  expr: ts.Expression,
  path: string[],
) => unknown | undefined;

/** Statically evaluate a JSON-like expression; NON_LITERAL when any part is not a literal. */
export function evalLiteral(
  expr: ts.Expression,
  resolve?: LiteralResolver,
  path: string[] = [],
): unknown | typeof NON_LITERAL {
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
    const inner = evalLiteral(expr.operand, resolve, path);
    return typeof inner === 'number' ? -inner : NON_LITERAL;
  }
  if (ts.isParenthesizedExpression(expr))
    return evalLiteral(expr.expression, resolve, path);
  if (ts.isArrayLiteralExpression(expr)) {
    const out: unknown[] = [];
    for (const [i, el] of expr.elements.entries()) {
      const v = evalLiteral(el, resolve, [...path, String(i)]);
      if (v === NON_LITERAL) return NON_LITERAL;
      out.push(v);
    }
    return out;
  }
  if (ts.isObjectLiteralExpression(expr)) {
    const out: Record<string, unknown> = {};
    for (const prop of expr.properties) {
      if (!ts.isPropertyAssignment(prop)) return NON_LITERAL;
      let key: string;
      if (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name))
        key = prop.name.text;
      else return NON_LITERAL;
      const v = evalLiteral(prop.initializer, resolve, [...path, key]);
      if (v === NON_LITERAL) return NON_LITERAL;
      out[key] = v;
    }
    return out;
  }
  if (resolve) {
    const v = resolve(expr, path);
    if (v !== undefined) return v;
  }
  return NON_LITERAL;
}
