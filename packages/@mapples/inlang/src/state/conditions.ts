import { ConditionFunc, Conditions } from './types';

/** Equality condition: (a, b) => a === b. @public */
export const eq: ConditionFunc = (a, b) => a === b;

/** Not-equals condition: (a, b) => a !== b. @public */
export const notEq: ConditionFunc = (a, b) => a !== b;

/** Map from Conditions enum to evaluator functions. @public */
export const conditionMap: Record<Conditions, ConditionFunc> = {
  [Conditions.equals]: eq,
  [Conditions.notEquals]: notEq,
};
