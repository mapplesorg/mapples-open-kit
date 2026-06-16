import { ConditionFunc, Conditions } from './types';

/** Strict-equality condition: returns `true` when `a === b`. */
export const eq: ConditionFunc = (a, b) => a === b;

/** Strict-inequality condition: returns `true` when `a !== b`. */
export const notEq: ConditionFunc = (a, b) => a !== b;

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
};
