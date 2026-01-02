import {
  SimpleCondition,
  BoolCondition,
  ParseConditionResult,
  ValueType,
  Conditions,
} from './types';

const mapTypes = {
  str: 'string',
  num: 'number',
  bool: 'boolean',
  string: 'string',
  number: 'number',
  boolean: 'boolean',
} as const;

export const parseCondition = (
  value: SimpleCondition | BoolCondition,
): ParseConditionResult => {
  const [dataProp, condition, valueProp] = value.trim().split('::');

  if (valueProp === 'true' || valueProp === 'false')
    return {
      dataProp,
      condition: condition as Conditions,
      valueProp: valueProp === 'true',
      valueType: 'boolean',
    };

  if (/^"[^"]*"$/.test(valueProp)) {
    const [value, type] = valueProp.split('::');

    return {
      dataProp,
      condition: condition as Conditions,
      valueProp: value.slice(1, -1),
      valueType:
        mapTypes[type as keyof typeof mapTypes] || ('string' as ValueType),
    };
  }

  return {
    dataProp,
    condition: condition as Conditions,
    valueProp,
    valueType: 'dataProp',
  };
};

export const isCondition = (value: unknown): value is SimpleCondition => {
  return (
    typeof value === 'string' &&
    /^[a-zA-Z0-9_.]+::[a-zA-Z0-9_]+::("[^"]*"|[a-zA-Z0-9_]*|)$/.test(value)
  );
};

export const toBool = (value: string | boolean) => {
  if (typeof value === 'boolean') return value;

  return value === 'true';
};

export const toNumber = (value: string | boolean) => {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  const numValue = Number(value);

  if (isNaN(numValue)) return 0;

  return numValue;
};
