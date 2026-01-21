import { ConditionFunc, Conditions } from './types';

export const eq: ConditionFunc = (a, b) => a === b;
export const notEq: ConditionFunc = (a, b) => a !== b;

export const conditionMap: Record<Conditions, ConditionFunc> = {
  [Conditions.equals]: eq,
  [Conditions.notEquals]: notEq,
};
