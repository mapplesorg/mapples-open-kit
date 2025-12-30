import { SimpleCondition, BoolCondition } from './types';

export const parseCondition = (value: SimpleCondition | BoolCondition) => {
  const [dataProp, condition, valueProp] = value.trim().split('::');

  if (valueProp === 'true' || valueProp === 'false')
    return {
      dataProp,
      condition,
      valueProp: valueProp === 'true',
    };

  return { dataProp, condition, valueProp };
};

export const isCondition = (value: unknown): value is SimpleCondition => {
  return (
    typeof value === 'string' &&
    /^[a-zA-Z0-9_]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/.test(value)
  );
};
