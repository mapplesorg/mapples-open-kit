// Prop conditions: the tests a component file writes on its own props
// (`isActive`, `!isActive`, `variant === 'primary'`) and the Creator's
// render-state conditions they stand for (`props.isActive::eq::true`). The
// canvas cannot run the file, so a style that depends on a prop reaches it as
// a state: `[styles.card, isActive && styles.cardActive]` reads as the base
// style plus a `style::isActive` variant under that state, and prints back
// the same way. Only single tests on a declared prop are read — anything
// richer stays an expression the canvas does not follow.

import ts from 'typescript';

import type { PropsBindings, PropsParam } from './signature.js';

/** Where a component's props live in the data state its conditions read. */
export const PROPS_SCOPE = 'props';

const PROP_PATH = new RegExp(`^${PROPS_SCOPE}\\.([A-Za-z_$][A-Za-z0-9_$]*)$`);

/** A render state read from a prop test, under its state key. */
export interface PropState {
  key: string;
  /** How the test reads in code — the name the inspector shows. */
  name: string;
  condition: string;
}

export interface PropScope {
  params: Map<string, PropsParam>;
  bindings: PropsBindings;
}

const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

/** `primary` → `Primary`, `sm-2` → `Sm2`: a literal as part of a state key. */
const keyWord = (value: string): string =>
  value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(capitalize)
    .join('');

const unwrap = (expr: ts.Expression): ts.Expression =>
  ts.isParenthesizedExpression(expr) ? unwrap(expr.expression) : expr;

/** The declared prop an expression reads, or null. */
function propOf(expr: ts.Expression, scope: PropScope): PropsParam | null {
  const e = unwrap(expr);
  let name: string | null = null;
  if (ts.isIdentifier(e)) {
    name = scope.bindings.locals.get(e.text) ?? null;
  } else if (
    ts.isPropertyAccessExpression(e) &&
    ts.isIdentifier(e.expression) &&
    scope.bindings.paramName !== null &&
    e.expression.text === scope.bindings.paramName
  ) {
    name = e.name.text;
  }
  return name === null ? null : (scope.params.get(name) ?? null);
}

/** A literal a condition string can carry, in condition syntax; null when it cannot. */
function conditionValue(
  expr: ts.Expression,
): { text: string; word: string; code: string } | null {
  const e = unwrap(expr);
  if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) {
    if (e.text.includes('"')) return null;
    return {
      text: `"${e.text}"`,
      word: keyWord(e.text),
      code: `'${e.text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`,
    };
  }
  if (ts.isNumericLiteral(e)) {
    return { text: e.text, word: keyWord(e.text), code: e.text };
  }
  if (
    ts.isPrefixUnaryExpression(e) &&
    e.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(e.operand)
  ) {
    return {
      text: `-${e.operand.text}`,
      word: `Minus${keyWord(e.operand.text)}`,
      code: `-${e.operand.text}`,
    };
  }
  if (e.kind === ts.SyntaxKind.TrueKeyword) {
    return { text: 'true', word: 'True', code: 'true' };
  }
  if (e.kind === ts.SyntaxKind.FalseKeyword) {
    return { text: 'false', word: 'False', code: 'false' };
  }
  return null;
}

/**
 * The state a prop test stands for, or null when the expression is not a
 * single test on a declared prop. Truthiness follows the prop's type: a
 * boolean is on when it is `true`, anything else when it is not empty.
 */
export function propStateOf(
  expr: ts.Expression,
  scope: PropScope,
): PropState | null {
  const e = unwrap(expr);
  const path = (param: PropsParam) => `${PROPS_SCOPE}.${param.name}`;

  const direct = propOf(e, scope);
  if (direct) {
    return {
      key: direct.name,
      name: direct.name,
      condition:
        direct.kind === 'boolean'
          ? `${path(direct)}::eq::true`
          : `${path(direct)}::isNotEmpty::`,
    };
  }

  if (
    ts.isPrefixUnaryExpression(e) &&
    e.operator === ts.SyntaxKind.ExclamationToken
  ) {
    const negated = propOf(e.operand, scope);
    if (!negated) return null;
    return {
      key: `not${capitalize(negated.name)}`,
      name: `!${negated.name}`,
      condition:
        negated.kind === 'boolean'
          ? `${path(negated)}::neq::true`
          : `${path(negated)}::isEmpty::`,
    };
  }

  if (ts.isBinaryExpression(e)) {
    const op = e.operatorToken.kind;
    if (
      op !== ts.SyntaxKind.EqualsEqualsEqualsToken &&
      op !== ts.SyntaxKind.ExclamationEqualsEqualsToken
    ) {
      return null;
    }
    let param = propOf(e.left, scope);
    let value = conditionValue(e.right);
    if (!param || !value) {
      param = propOf(e.right, scope);
      value = conditionValue(e.left);
    }
    if (!param || !value) return null;
    const equal = op === ts.SyntaxKind.EqualsEqualsEqualsToken;
    return {
      key: `${param.name}Is${equal ? '' : 'Not'}${value.word}`,
      name: `${param.name} ${equal ? '===' : '!=='} ${value.code}`,
      condition: `${path(param)}::${equal ? 'eq' : 'neq'}::${value.text}`,
    };
  }
  return null;
}

/**
 * The code a prop condition prints as — the inverse of `propStateOf` — or
 * null when the condition does not test a component prop (a data-state
 * condition keeps its `style::key` variant as a literal).
 */
export function propTestCode(condition: string): string | null {
  const [path, op, value = ''] = condition.split('::');
  const match = PROP_PATH.exec(path ?? '');
  if (!match) return null;
  const name = match[1]!;
  switch (op) {
    case 'eq':
    case 'neq': {
      if (op === 'eq' && value === 'true') return name;
      if (op === 'neq' && value === 'true') return `!${name}`;
      const operator = op === 'eq' ? '===' : '!==';
      if (/^"[^"]*"$/.test(value)) {
        const text = value.slice(1, -1);
        return `${name} ${operator} '${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
      }
      if (value === 'false' || /^-?\d+(\.\d+)?$/.test(value)) {
        return `${name} ${operator} ${value}`;
      }
      return null;
    }
    case 'isNotEmpty':
      return value === '' ? name : null;
    case 'isEmpty':
      return value === '' ? `!${name}` : null;
    default:
      return null;
  }
}

const NEGATED: Record<string, string> = {
  eq: 'neq',
  neq: 'eq',
  isEmpty: 'isNotEmpty',
  isNotEmpty: 'isEmpty',
  gt: 'lte',
  lte: 'gt',
  gte: 'lt',
  lt: 'gte',
  contains: 'notContains',
  notContains: 'contains',
};

/** The condition that holds exactly when `condition` does not — the `else` of a ternary. */
export function negateCondition(condition: string): string {
  const [path, op, ...value] = condition.split('::');
  const negated = NEGATED[op ?? ''];
  if (negated === undefined) {
    throw new Error(`condition \`${condition}\` has no negation`);
  }
  return [path, negated, ...value].join('::');
}

/**
 * The state a prop condition stands for, keyed and named as `propStateOf`
 * would read its code (`props.isActive::neq::true` → `notIsActive`,
 * `!isActive`) — for tests that exist only as a condition, like the `else`
 * branch of a ternary. Null when the condition is not a printable prop test.
 */
export function propStateForCondition(condition: string): PropState | null {
  const name = propTestCode(condition);
  const prop = propOfCondition(condition);
  if (name === null || prop === null) return null;
  const [, op, value = ''] = condition.split('::');
  const word = (v: string): string =>
    /^"[^"]*"$/.test(v)
      ? keyWord(v.slice(1, -1))
      : v.startsWith('-')
        ? `Minus${keyWord(v.slice(1))}`
        : keyWord(v);
  let key: string;
  if ((op === 'eq' && value === 'true') || op === 'isNotEmpty') key = prop;
  else if ((op === 'neq' && value === 'true') || op === 'isEmpty')
    key = `not${capitalize(prop)}`;
  else key = `${prop}Is${op === 'neq' ? 'Not' : ''}${word(value)}`;
  return { key, name, condition };
}

/** The prop a prop condition tests, or null. */
export function propOfCondition(condition: string): string | null {
  return PROP_PATH.exec(condition.split('::')[0] ?? '')?.[1] ?? null;
}
