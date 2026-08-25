import { FN_SEPARATOR } from '../constants';

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

/**
 * Joins one or more string parts into a single `::` -separated condition
 * string.
 *
 * @param values - The parts to join (e.g. a data-prop, condition operator, and
 *   comparison value).
 * @returns A `::` -delimited string (e.g. `"user.age::eq::18"`).
 *
 * @example
 * ```ts
 * toConditionString('user.age', 'eq', '18'); // 'user.age::eq::18'
 * ```
 *
 * @public
 */
export const toConditionString = (...values: string[]) => {
  return values.join(FN_SEPARATOR);
};

/**
 * Parses a raw condition string into its component parts without type coercion
 * of the value.
 *
 * Unlike {@link parseCondition}, this function does not attempt to convert the
 * value to a boolean or detect quoted/typed literals — it returns the raw
 * string fragments and always sets `valueType` to `'string'`. Prefer
 * {@link parseCondition} when the full type-aware parsing is needed.
 *
 * @param value - The raw condition string to parse (e.g. `"user.age::eq::18"`).
 * @returns A {@link ParseConditionResult} with `valueType` always set to
 *   `'string'`.
 *
 * @example
 * ```ts
 * parseConditionString('user.age::eq::18');
 * // { dataProp: 'user.age', condition: 'eq', valueProp: '18', valueType: 'string' }
 * ```
 *
 * @public
 */
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

  if (/^-?\d+(\.\d+)?$/.test(valueProp))
    return {
      dataProp,
      condition: condition as Conditions,
      valueProp,
      valueType: 'number',
    };

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
 * - `value` can be a quoted string, an unquoted path/number, or empty
 *   (unary operators like `isEmpty` leave it empty)
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
    /^[a-zA-Z0-9_.]+::[a-zA-Z0-9_]+::("[^"]*"|-?[a-zA-Z0-9_.]*|)$/.test(value)
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

/**
 * Strips newline characters from `key` and splits it on semicolons, returning
 * an array of the resulting segments.
 *
 * Returns `undefined` when `key` is `undefined`.
 *
 * @param key - An optional semicolon-delimited string, possibly containing
 *   newline characters.
 * @returns An array of string segments, or `undefined` if `key` is not
 *   provided.
 *
 * @example
 * ```ts
 * parseJoin('a;b;c');       // ['a', 'b', 'c']
 * parseJoin('a;\nb');       // ['a', 'b']
 * parseJoin(undefined);     // undefined
 * ```
 *
 * @public
 */
export const parseJoin = (key?: string) => {
  return key?.replace(/\n/g, '').split(';');
};
