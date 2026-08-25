import { parseDims } from '@mapples/inlang';
import { compact, isArray, isNumber, isObject, map, mapValues } from 'lodash';
import { Dimensions } from 'react-native';

import { CanvasDimensions } from '../types';

/**
 * Type guard to check if a value is a boxShadow object with the expected structure.
 *
 * @param value - The value to check
 * @returns `true` if the value is a boxShadow object, `false` otherwise
 *
 * @example
 * ```ts
 * isBoxShadowObject({ x: 2, y: 4, radius: 8, color: '#000' }); // true
 * isBoxShadowObject({ x: 2 }); // true
 * isBoxShadowObject({ width: 100 }); // false
 * ```
 */
export const isBoxShadowObject = (
  value: unknown,
): value is {
  color?: string;
  x?: number;
  y?: number;
  radius?: number;
} => {
  return (
    isObject(value) &&
    !isArray(value) &&
    ('x' in value || 'y' in value || 'radius' in value || 'color' in value)
  );
};

/**
 * Converts a boxShadow object to a CSS box-shadow string.
 *
 * @param boxShadow - The boxShadow object to convert
 * @param getColor - Function to resolve theme color references (e.g., 'theme.colors.primary')
 * @returns CSS box-shadow string in the format: "xpx ypx radiuspx color"
 *
 * @example
 * ```ts
 * parseBoxShadow(
 *   { x: 2, y: 4, radius: 8, color: 'theme.colors.shadow' },
 *   (color) => '#000000'
 * );
 * // Returns: "2px 4px 8px #000000"
 * ```
 */
export const parseBoxShadow = (
  boxShadow: { color?: string; x?: number; y?: number; radius?: number },
  getColor: (color: string) => string,
): string => {
  const x = boxShadow.x ?? 0;
  const y = boxShadow.y ?? 0;
  const radius = boxShadow.radius ?? 0;
  const color = boxShadow.color
    ? getColor(boxShadow.color)
    : 'rgba(0, 0, 0, 0.25)';

  return `${x}px ${y}px ${radius}px ${color}`;
};

/**
 * Recursively processes exotic keys like `boxShadow` and `zIndex` throughout nested structures.
 * Converts boxShadow objects to CSS strings and ensures zIndex values are numbers.
 *
 * @param obj - The object or array to process (can be deeply nested)
 * @param getColor - Function to resolve theme color references
 * @param _canvas - Optional utility canvas dimensions for inner use
 * @returns Processed object with exotic keys converted to their proper formats
 *
 * @example
 * ```ts
 * processExoticKeys(
 *   {
 *     boxShadow: { x: 2, y: 4, radius: 8, color: 'theme.colors.shadow' },
 *     zIndex: '10',
 *     nested: { boxShadow: { x: 1, y: 1, radius: 2 } }
 *   },
 *   (color) => '#000000'
 * );
 * // Returns: {
 * //   boxShadow: "2px 4px 8px #000000",
 * //   zIndex: 10,
 * //   nested: { boxShadow: "1px 1px 2px rgba(0, 0, 0, 0.25)" }
 * // }
 * ```
 */
export const processExoticKeys = (
  obj: any,
  getColor: (color: string) => string,
  _canvas?: CanvasDimensions,
): any => {
  if (isArray(obj)) {
    return obj.map((item) => processExoticKeys(item, getColor, _canvas));
  }

  if (isObject(obj) && !isArray(obj)) {
    return mapValues(obj, (value, key) => {
      if (key === 'boxShadow' && isBoxShadowObject(value)) {
        return parseBoxShadow(value, getColor);
      }

      if (key === 'width' || key === 'height') {
        const dimsValue = parseDims(value);

        if (!dimsValue) return value;

        const [type, percent] = dimsValue;

        return (
          (_canvas ? _canvas[type] : Dimensions.get('window')[type]) * percent
        );
      }

      if (key === 'zIndex' && !isNumber(value)) {
        // `parseInt` never throws — it yields NaN — so a malformed zIndex used
        // to slip through as an undefined/NaN layer and produce stacking bugs
        // that are near-impossible to trace back. Reject it at the source.
        const parsed = parseInt(value);

        if (!Number.isFinite(parsed)) {
          throw new Error(
            `Invalid zIndex style value: ${JSON.stringify(value)} is not a number`,
          );
        }

        return parsed;
      }

      // Recursively process nested objects and arrays
      if (isObject(value) || isArray(value)) {
        return processExoticKeys(value, getColor, _canvas);
      }

      return value;
    });
  }

  return obj;
};

/**
 * Recursively processes styled props, applying responsive styles to objects at all nesting levels.
 * This ensures that nested objects within arrays and objects get responsive styles applied correctly.
 *
 * @param value - The value to process (can be a primitive, object, or array)
 * @param getResponsiveStyle - Function to apply responsive styles based on current breakpoint
 * @returns Processed value with responsive styles applied recursively throughout the structure
 *
 * @example
 * ```ts
 * applyResponsiveStylesRecursively(
 *   [
 *     { fontSize: 16, '&:tablet': { fontSize: 20 } },
 *     { padding: 8, '&:desktop': { padding: 16 } }
 *   ],
 *   getResponsiveStyle
 * );
 * // Returns array with responsive styles applied to each object
 * ```
 */
export const applyResponsiveStylesRecursively = (
  value: any,
  getResponsiveStyle: <T>(style: T) => T,
): any => {
  if (isArray(value)) {
    return map(compact(value), (item) => {
      // Apply responsive styles to the item if it's an object
      const processed =
        isObject(item) && !isArray(item) ? getResponsiveStyle(item) : item;
      // Recursively process nested structures
      return applyResponsiveStylesRecursively(processed, getResponsiveStyle);
    });
  }

  if (isObject(value) && !isArray(value)) {
    // Apply responsive styles to the object itself
    const responsive = getResponsiveStyle(value);
    // Then recursively process all nested values
    return mapValues(responsive, (nestedValue) =>
      applyResponsiveStylesRecursively(nestedValue, getResponsiveStyle),
    );
  }

  return value;
};
