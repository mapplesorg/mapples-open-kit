import { ConditionFunc, Conditions } from './types';

const eq: ConditionFunc = (a, b) => a === b;
const notEq: ConditionFunc = (a, b) => a !== b;

const conditionMap: Record<Conditions, ConditionFunc> = {
  [Conditions.equals]: eq,
  [Conditions.notEquals]: notEq,
};

export default conditionMap;
