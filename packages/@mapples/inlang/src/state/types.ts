/**
 * Enumeration of condition operators for evaluating data properties.
 *
 * Used in condition strings to specify how to compare a data property value
 * against another value.
 *
 * @enum Conditions
 * @public
 */
export enum Conditions {
  /** Equality condition - checks if values are equal */
  equals = 'eq',
  /** Not equals condition - checks if values are not equal */
  notEquals = 'neq',
}

/**
 * Type representing a simple condition string.
 *
 * Format: `${dataProp}::${condition}::${value}`
 * where dataProp is a path, condition is a Conditions operator, and value is a string.
 *
 * @type SimpleCondition
 * @public
 */
export type SimpleCondition = `${string}::${Conditions}::${string}`;

/**
 * Type representing a boolean condition string.
 *
 * Format: `${dataProp}::${condition}::${'true' | 'false'}`
 * Used for conditions that compare against boolean values.
 *
 * @type BoolCondition
 * @public
 */
export type BoolCondition = `${string}::${Conditions}::${'true' | 'false'}`;

/**
 * Function type for condition evaluation.
 *
 * Takes two values and returns a boolean indicating whether the condition is met.
 *
 * @type ConditionFunc
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns True if the condition is satisfied, false otherwise
 * @public
 */
export type ConditionFunc = (a: unknown, b: unknown) => boolean;

/**
 * Type representing the type of a value in a condition.
 *
 * @type ValueType
 * @public
 */
export type ValueType = 'string' | 'number' | 'boolean' | 'dataProp';

/**
 * Result of parsing a condition string.
 *
 * Contains the parsed components of a condition string including the data property path,
 * the condition operator, the value to compare against, and the type of that value.
 *
 * @interface ParseConditionResult
 * @property dataProp - The data property path to evaluate
 * @property condition - The condition operator to use
 * @property valueProp - The value to compare against
 * @property valueType - The type of the value (string, number, boolean, or dataProp)
 * @public
 */
export interface ParseConditionResult {
  dataProp: string;
  condition: Conditions;
  valueProp: string | boolean;
  valueType: ValueType;
}
