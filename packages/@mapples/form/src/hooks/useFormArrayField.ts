import { useCallback, useContext, useEffect, useState } from 'react';

import { cloneDeep, drop, dropRight, indexOf } from 'lodash';

import FormContext from '../context';

/**
 * Hook to manage array fields with specialized array manipulation methods.
 * This hook provides methods to add, remove, and manipulate array items in a form field.
 *
 * @template T - The type of items in the array
 * @param fieldPath - Dot notation path to the array field
 * @param fallbackValue - Default array value to use if field is undefined
 * @returns Object containing array value and manipulation methods
 *
 * @example
 * ```tsx
 * const TagsField = () => {
 *   const { value, api } = useFormArrayField<string>('tags', []);
 *
 *   return (
 *     <div>
 *       {value.map((tag, index) => (
 *         <div key={index}>
 *           {tag}
 *           <button onClick={() => api.remove(index)}>Remove</button>
 *         </div>
 *       ))}
 *       <button onClick={() => api.push('New Tag')}>Add Tag</button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @public
 */
const useFormArrayField = <T>(fieldPath: string, fallbackValue?: T[]) => {
  const { form, initialized } = useContext(FormContext);

  const [value, setValue] = useState<T[] | undefined>();

  useEffect(() => {
    const unsubscribe = form?.subscribeOnHistoryChange(() => {
      setValue(form?.getValue<T[]>(fieldPath) || fallbackValue);
    });

    return () => {
      unsubscribe?.();
    };
  }, [fallbackValue, fieldPath, form]);

  useEffect(() => {
    if (initialized) {
      setValue(form?.getValue<T[]>(fieldPath));
    }
  }, [fieldPath, form, initialized]);

  const fieldPush = useCallback(
    (item: T) => {
      setValue((prev) => {
        const valueClone = cloneDeep(prev);
        valueClone?.push(item);
        form?.setValue(fieldPath, valueClone);
        return valueClone;
      });
    },
    [fieldPath, form],
  );

  const fieldDropLeft = useCallback(
    (count?: number) => {
      setValue((prev) => {
        const valueClone = drop(cloneDeep(prev), count);
        form?.setValue(fieldPath, valueClone);
        return valueClone;
      });
    },
    [fieldPath, form],
  );

  const fieldDropRight = useCallback(
    (count?: number) => {
      setValue((prev) => {
        const valueClone = dropRight(cloneDeep(prev), count);
        form?.setValue(fieldPath, valueClone);
        return valueClone;
      });
    },
    [fieldPath, form],
  );

  const fieldRemove = useCallback(
    (index: number) => {
      setValue((prev) => {
        const valueClone = cloneDeep(prev);
        valueClone?.splice(index, 1);
        form?.setValue(fieldPath, valueClone);
        return valueClone;
      });
    },
    [fieldPath, form],
  );

  const fieldPaste = useCallback(
    (item: T, index: number) => {
      setValue((prev) => {
        const valueClone = cloneDeep(prev);
        valueClone?.splice(index, 0, item);
        form?.setValue(fieldPath, valueClone);
        return valueClone;
      });
    },
    [fieldPath, form],
  );

  const fieldToggle = useCallback(
    (item: T) => {
      const itemIndex = indexOf(value, item);
      if (itemIndex < 0) {
        fieldPush(item);
      } else {
        fieldRemove(itemIndex);
      }
    },
    [fieldPush, fieldRemove, value],
  );

  return {
    value: value || fallbackValue,
    api: {
      push: fieldPush,
      dropLeft: fieldDropLeft,
      dropRight: fieldDropRight,
      remove: fieldRemove,
      paste: fieldPaste,
      toggle: fieldToggle,
    },
  };
};

export default useFormArrayField;
