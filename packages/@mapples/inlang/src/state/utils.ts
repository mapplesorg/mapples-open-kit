import { FN_SEPARATOR } from '@mapples/inlang';

import { ConditionStringRegExp } from './regexp';
import {
  BoolCondition,
  Conditions,
  ParseConditionResult,
  SimpleCondition,
  ValueType,
} from './types';

const mapTypes = {
  str: 'string',
  num: 'number',
  bool: 'boolean',
  string: 'string',
  number: 'number',
  boolean: 'boolean',
} as const;

export const toConditionString = (...values: string[]) => {
  return values.join(FN_SEPARATOR);
};

export const parseConditionString = (value: string): ParseConditionResult => {
  const [dataProp, condition, valueProp] = value
    .trim()
    .split(ConditionStringRegExp);

  return {
    dataProp,
    condition: condition as Conditions,
    valueProp: valueProp,
    valueType: 'string',
  };
};

/**
 * Parses a condition string into its component parts.
 *
 * Condition strings follow the format: `dataProp::condition::value`
 * - `dataProp`: The data property path to evaluate
 * - `condition`: The condition operator (eq, neq)
 * - `value`: The value to compare against (can be a string, boolean, or dataProp reference)
 *
 * @param value - The condition string to parse (e.g., "user.age::eq::18" or "user.active::eq::true")
 * @returns A parsed condition result with dataProp, condition, valueProp, and valueType
 *
 * @example
 * ```tsx
 * const result = parseCondition("user.age::eq::18");
 * // Returns: { dataProp: "user.age", condition: Conditions.equals, valueProp: "18", valueType: "dataProp" }
 *
 * const boolResult = parseCondition("user.active::eq::true");
 * // Returns: { dataProp: "user.active", condition: Conditions.equals, valueProp: true, valueType: "boolean" }
 * ```
 *
 * @public
 */
export const parseCondition = (
  value: SimpleCondition | BoolCondition,
): ParseConditionResult => {
  const [dataProp, condition, valueProp] = value
    .trim()
    .split(ConditionStringRegExp);

  if (valueProp === 'true' || valueProp === 'false')
    return {
      dataProp,
      condition: condition as Conditions,
      valueProp: valueProp === 'true',
      valueType: 'boolean',
    };

  if (/^"[^"]*"$/.test(valueProp)) {
    const parsedValue = valueProp.slice(1, -1);
    const [value, type] = parsedValue.split(FN_SEPARATOR);

    return {
      dataProp,
      condition: condition as Conditions,
      valueProp: value,
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

/**
 * Type guard that checks if a value is a valid condition string.
 *
 * Valid condition strings follow the pattern: `dataProp::condition::value`
 * where:
 * - `dataProp` is alphanumeric with dots and underscores
 * - `condition` is alphanumeric with underscores
 * - `value` can be a quoted string, alphanumeric, or empty
 *
 * @param value - The value to check
 * @returns True if the value is a valid condition string, false otherwise
 *
 * @example
 * ```tsx
 * isCondition("user.age::eq::18"); // true
 * isCondition("user.active::eq::true"); // true
 * isCondition("invalid"); // false
 * isCondition(123); // false
 * ```
 *
 * @public
 */
export const isCondition = (value: unknown): value is SimpleCondition => {
  return (
    typeof value === 'string' &&
    /^[a-zA-Z0-9_.]+::[a-zA-Z0-9_]+::("[^"]*"|[a-zA-Z0-9_]*|)$/.test(value)
  );
};

/**
 * Converts a string or boolean value to a boolean.
 *
 * String values are converted by checking if they equal the string "true".
 * Boolean values are returned as-is.
 *
 * @param value - The value to convert (string or boolean)
 * @returns The boolean representation of the value
 *
 * @example
 * ```tsx
 * toBool("true"); // true
 * toBool("false"); // false
 * toBool(true); // true
 * toBool(false); // false
 * toBool("yes"); // false
 * ```
 *
 * @public
 */
export const toBool = (value: string | boolean) => {
  if (typeof value === 'boolean') return value;

  return value === 'true';
};

/**
 * Converts a string or boolean value to a number.
 *
 * - Boolean values: true becomes 1, false becomes 0
 * - String values: parsed using Number(), returns 0 if NaN
 *
 * @param value - The value to convert (string or boolean)
 * @returns The numeric representation of the value (0 if conversion fails)
 *
 * @example
 * ```tsx
 * toNumber("123"); // 123
 * toNumber("45.67"); // 45.67
 * toNumber(true); // 1
 * toNumber(false); // 0
 * toNumber("invalid"); // 0
 * ```
 *
 * @public
 */
export const toNumber = (value: string | boolean) => {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  const numValue = Number(value);

  if (isNaN(numValue)) return 0;

  return numValue;
};

export const parseJoin = (key?: string) => {
  return key?.replace(/\n/g, '').split(';');
};
