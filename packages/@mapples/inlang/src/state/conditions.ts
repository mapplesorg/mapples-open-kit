import { ConditionFunc, Conditions } from './types';

/** Strict-equality condition: returns `true` when `a === b`. */
export const eq: ConditionFunc = (a, b) => a === b;

/** Strict-inequality condition: returns `true` when `a !== b`. */
export const notEq: ConditionFunc = (a, b) => a !== b;

/** Coerce an arbitrary state value to a number for ordering comparisons. */
const asNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  const parsed = Number(value ?? NaN);
  return isNaN(parsed) ? 0 : parsed;
};

/** Numeric `>` comparison; both operands are coerced via {@link asNumber}. */
export const gt: ConditionFunc = (a, b) => asNumber(a) > asNumber(b);

/** Numeric `>=` comparison; both operands are coerced via {@link asNumber}. */
export const gte: ConditionFunc = (a, b) => asNumber(a) >= asNumber(b);

/** Numeric `<` comparison; both operands are coerced via {@link asNumber}. */
export const lt: ConditionFunc = (a, b) => asNumber(a) < asNumber(b);

/** Numeric `<=` comparison; both operands are coerced via {@link asNumber}. */
export const lte: ConditionFunc = (a, b) => asNumber(a) <= asNumber(b);

/**
 * Membership condition: array `a` includes `b`, or string `a` contains the
 * substring `String(b)`. Non-string/array subjects are stringified.
 */
export const contains: ConditionFunc = (a, b) => {
  if (Array.isArray(a)) return a.includes(b);
  if (a == null) return false;
  return String(a).includes(String(b));
};

/** Negated {@link contains}. */
export const notContains: ConditionFunc = (a, b) => !contains(a, b);

const empty = (a: unknown): boolean => {
  if (a == null || a === '') return true;
  if (Array.isArray(a)) return a.length === 0;
  if (typeof a === 'object') return Object.keys(a).length === 0;
  return false;
};

/**
 * Unary emptiness condition: `true` for null/undefined, `''`, empty arrays
 * and plain objects with no keys. Numbers and booleans are never empty.
 */
export const isEmpty: ConditionFunc = (a) => empty(a);

/** Negated {@link isEmpty}. */
export const isNotEmpty: ConditionFunc = (a) => !empty(a);

/**
 * Lookup map from each {@link Conditions} operator to its corresponding
 * {@link ConditionFunc} implementation.
 *
 * Use this map to resolve a condition operator string to an executable function
 * at runtime.
 *
 * @example
 * ```ts
 * const fn = conditionMap[Conditions.equals];
 * fn('foo', 'foo'); // true
 * ```
 *
 * @public
 */
export const conditionMap: Record<Conditions, ConditionFunc> = {
  [Conditions.equals]: eq,
  [Conditions.notEquals]: notEq,
  [Conditions.greaterThan]: gt,
  [Conditions.greaterOrEqual]: gte,
  [Conditions.lessThan]: lt,
  [Conditions.lessOrEqual]: lte,
  [Conditions.contains]: contains,
  [Conditions.notContains]: notContains,
  [Conditions.isEmpty]: isEmpty,
  [Conditions.isNotEmpty]: isNotEmpty,
};
