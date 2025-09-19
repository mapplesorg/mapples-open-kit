import {
  reduce,
  keys,
  isObject,
  join,
  omitBy,
  isUndefined,
  compact,
} from 'lodash';
import { ColorValue, StyleProp, StyleSheet, TextStyle } from 'react-native';

import { CalcValue, HEX, MultiplyValue, RGB, RGBA, ThemeMap } from '../types';

/**
 * Recursively extracts all key paths from a nested object.
 * 
 * @param object - The object to extract paths from
 * @param prevKey - The previous key path (used for recursion)
 * @returns Array of dot-notation paths to all leaf values
 * 
 * @example
 * ```tsx
 * const paths = getKeysPaths({
 *   colors: { primary: '#007AFF', secondary: { light: '#FFF' } }
 * });
 * // Returns: ['colors.primary', 'colors.secondary.light']
 * ```
 */
export const getKeysPaths = <T extends object, K extends keyof T>(
  object: T,
  prevKey = '',
): string[] => {
  return reduce(
    keys(object) as K[],
    (acc, key) => {
      const pathKey = join(compact([prevKey || undefined, key]), '.');
      const value = object[key];

      if (isObject(value)) {
        return [...acc, ...getKeysPaths(value, pathKey)];
      }

      return [...acc, pathKey];
    },
    [] as string[],
  );
};

/**
 * Checks if a string value is a valid HEX color.
 * 
 * @param value - The string to check
 * @returns True if the value is a valid HEX color
 * 
 * @example
 * ```tsx
 * isColorValue('#FF0000'); // true
 * isColorValue('#FFF'); // true
 * isColorValue('red'); // false
 * ```
 */
export const isColorValue = (value: string) => {
  return /^#([A-Fa-f0-9]{3}){1,2}$/.test(value);
};

/**
 * Normalizes text styles for web compatibility by converting numeric values to pixel strings.
 * 
 * @param textStyle - The text style to normalize
 * @returns Normalized text style with web-compatible values
 * 
 * @example
 * ```tsx
 * const normalized = normalizeTextStyleWeb({
 *   lineHeight: 20,
 *   letterSpacing: 1
 * });
 * // Returns: { lineHeight: '20px', letterSpacing: '1px' }
 * ```
 */
export const normalizeTextStyleWeb = (
  textStyle?: StyleProp<TextStyle>,
): TextStyle | undefined => {
  if (!textStyle) {
    return;
  }

  const { lineHeight, letterSpacing, ...otherTextStyle } =
    StyleSheet.flatten(textStyle);

  const normalizedStyle = {
    ...otherTextStyle,
    lineHeight: lineHeight ? `${lineHeight}px` : lineHeight,
    letterSpacing: letterSpacing ? `${letterSpacing}px` : letterSpacing,
  } as TextStyle;

  return omitBy(normalizedStyle, isUndefined);
};

/**
 * Creates a regular expression pattern for matching theme and sizing references in strings.
 * 
 * @param theme - The theme object to extract paths from
 * @returns Regular expression for matching theme/sizing references
 * 
 * @example
 * ```tsx
 * const regex = getThemeRegexp({ colors: { primary: '#007AFF' } });
 * const match = 'theme.colors.primary'.match(regex);
 * ```
 */
export const getThemeRegexp = <T extends object>(theme: T) => {
  const pattern = join(
    getKeysPaths(theme)
      .map((value) => {
        return value.startsWith('sizing') ? `"${value}"` : value;
      })
      .sort((a, b) => b.length - a.length),
    '|',
  );

  return new RegExp(`${pattern}|"\\*\\d+"|"calc\\(.*?\\)"`, 'gi');
};

/**
 * Type guard to check if a value is a valid color string (RGB, RGBA, or HEX).
 * 
 * @param color - The value to check
 * @returns True if the value is a valid color string
 * 
 * @example
 * ```tsx
 * isColorString('#FF0000'); // true
 * isColorString('rgb(255, 0, 0)'); // true
 * isColorString('rgba(255, 0, 0, 0.5)'); // true
 * isColorString('red'); // false
 * ```
 */
export const isColorString = (
  color: ColorValue | ThemeMap,
): color is RGB | RGBA | HEX => {
  if (typeof color !== 'string') {
    return false;
  }

  return (
    /^rgb\(\d+,\s\d+,\s\d+\)$/.test(color) ||
    /^rgba\(\d+,\s\d+,\s\d+,\s\d+(\.\d+)?\)$/.test(color) ||
    /^#[0-9a-fA-F]+$/.test(color)
  );
};

/**
 * Type guard to check if a value is a multiplier expression (e.g., '*2', '*3').
 * 
 * @param value - The value to check
 * @returns True if the value is a multiplier expression
 * 
 * @example
 * ```tsx
 * isMultiply('*2'); // true
 * isMultiply('2*'); // false
 * isMultiply('calc(2 * 4)'); // false
 * ```
 */
export const isMultiply = <T extends string>(
  value: T | MultiplyValue,
): value is MultiplyValue => {
  return typeof value === 'string' && value.startsWith('*');
};

/**
 * Type guard to check if a value is a calc expression (e.g., 'calc(100% - 20px)').
 * 
 * @param value - The value to check
 * @returns True if the value is a calc expression
 * 
 * @example
 * ```tsx
 * isCalc('calc(100% - 20px)'); // true
 * isCalc('*2'); // false
 * isCalc('100px'); // false
 * ```
 */
export const isCalc = <T extends string>(
  value: T | CalcValue,
): value is CalcValue => {
  return (
    typeof value === 'string' &&
    value.startsWith('calc(') &&
    value.endsWith(')')
  );
};

/**
 * Parses a calc expression and evaluates it with the given base value.
 * Supports simple operations like addition and subtraction with multipliers.
 * 
 * @param value - The calc expression to parse
 * @param base - The base value to use for calculations
 * @returns The calculated numeric result
 * 
 * @example
 * ```tsx
 * parseCalc('calc(*2 - 10)', 20); // Returns: 30 (20*2 - 10)
 * parseCalc('calc(*3 + 5)', 10); // Returns: 35 (10*3 + 5)
 * ```
 */
export const parseCalc = (value: string, base: number): number => {
  // Extract the expression inside calc()
  const expression = value.substring(5, value.length - 1);

  // Replace *n with base*n
  const parsedExpression = expression.replace(/\*(\d+)/g, (_, n) => {
    return (base * parseInt(n, 10)).toString();
  });

  // Evaluate the expression
  // For now, we only support simple operations like *n - m or *n + m
  const match = parsedExpression.match(/^(\d+)\s*([-+])\s*(\d+)$/);
  if (match) {
    const [, leftStr, operator, rightStr] = match;
    const left = parseInt(leftStr, 10);
    const right = parseInt(rightStr, 10);

    if (operator === '+') {
      return left + right;
    } else if (operator === '-') {
      return left - right;
    }
  }

  // If we can't parse the expression, return the base value
  return base;
};
