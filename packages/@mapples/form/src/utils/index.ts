/**
 * Compares two objects and returns the differences between them.
 * This utility function performs a deep comparison and returns an object
 * containing the differences between the two input objects.
 *
 * @template T - The type of objects being compared
 * @param obj1 - First object to compare
 * @param obj2 - Second object to compare
 * @param excludeKeys - Array of keys to exclude from comparison (optional)
 * @returns Object containing diff keys and values, empty object if no differences
 * 
 * @example
 * ```tsx
 * const obj1 = { name: 'John', age: 30, city: 'NYC' };
 * const obj2 = { name: 'Jane', age: 30, city: 'LA' };
 * const diff = objectDiff(obj1, obj2, ['age']); // Excludes age from comparison
 * // Result: { name: { _value: { from: 'John', to: 'Jane' } }, city: { _value: { from: 'NYC', to: 'LA' } } }
 * ```
 * 
 * @public
 */
export function objectDiff<T>(
  obj1: T,
  obj2: T,
  excludeKeys: string[] = [],
): Record<string, any> {
  const diff: Record<string, any> = {};

  // Handle primitive types and null/undefined
  if (obj1 === obj2) {
    return {}; // No difference
  }

  // Handle null/undefined cases
  if (obj1 == null || obj2 == null) {
    return { _value: { from: obj1, to: obj2 } }; // Different
  }

  // Handle different types
  if (typeof obj1 !== typeof obj2) {
    return { _value: { from: obj1, to: obj2 } }; // Different
  }

  // Handle arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return { _value: { from: obj1, to: obj2 } }; // Different lengths
    }

    for (let i = 0; i < obj1.length; i++) {
      const elementDiff = objectDiff(obj1[i], obj2[i]);
      if (Object.keys(elementDiff).length > 0) {
        diff[i.toString()] = elementDiff;
      }
    }

    return diff;
  }

  // Handle objects
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1 as object).filter(
      (key) => !excludeKeys.includes(key),
    );
    const keys2 = Object.keys(obj2 as object).filter(
      (key) => !excludeKeys.includes(key),
    );

    // Check for keys in obj1 but not in obj2
    for (const key of keys1) {
      if (!keys2.includes(key)) {
        diff[key] = { removed: (obj1 as any)[key] };
      } else {
        const valueDiff = objectDiff(
          (obj1 as any)[key],
          (obj2 as any)[key],
          excludeKeys,
        );
        if (Object.keys(valueDiff).length > 0) {
          diff[key] = valueDiff;
        }
      }
    }

    // Check for keys in obj2 but not in obj1
    for (const key of keys2) {
      if (!keys1.includes(key)) {
        diff[key] = { added: (obj2 as any)[key] };
      }
    }

    return diff;
  }

  // For all other cases (primitives that are not equal)
  return { _value: { from: obj1, to: obj2 } };
}

/**
 * Checks if an object is empty (has no enumerable properties).
 * This utility function determines whether an object has any own enumerable properties.
 *
 * @param obj - Object to check
 * @returns True if object is empty (no enumerable properties), false otherwise
 * 
 * @example
 * ```tsx
 * isEmpty({}); // true
 * isEmpty({ name: 'John' }); // false
 * isEmpty({ length: 0 }); // false (has enumerable property)
 * ```
 * 
 * @public
 */
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}