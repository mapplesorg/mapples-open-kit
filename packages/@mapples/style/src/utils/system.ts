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

export const isColorValue = (value: string) => {
  return /^#([A-Fa-f0-9]{3}){1,2}$/.test(value);
};

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

export const isMultiply = <T extends string>(
  value: T | MultiplyValue,
): value is MultiplyValue => {
  return typeof value === 'string' && value.startsWith('*');
};

export const isCalc = <T extends string>(
  value: T | CalcValue,
): value is CalcValue => {
  return (
    typeof value === 'string' &&
    value.startsWith('calc(') &&
    value.endsWith(')')
  );
};

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
