import { useCallback, useEffect, useState } from 'react';

import { cloneDeep, drop, dropRight, indexOf } from 'lodash';

import useForm from './useForm';

/**
 * Hook to manage array fields with specialized array manipulation methods.
 * This hook provides methods to add, remove, and manipulate array items in a form field.
 * Changes are reflected reactively via history-change subscriptions on the underlying FormState.
 *
 * @template T - The type of items in the array
 * @param fieldPath - Dot notation path to the array field (e.g., `'tags'`)
 * @returns Object containing the current array value and an `api` object with mutation helpers:
 *   `push`, `dropLeft`, `dropRight`, `remove`, `paste`, and `toggle`
 *
 * @example
 * ```tsx
 * const TagsField = () => {
 *   const { value, api } = useFormArrayField<string>('tags');
 *
 *   return (
 *     <div>
 *       {value?.map((tag, index) => (
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
const useFormArrayField = <T>(fieldPath: string) => {
  const { form } = useForm();

  const [value, setValue] = useState<T[] | undefined>();

  useEffect(() => {
    const unsubscribe = form?.subscribeOnHistoryChange(() => {
      setValue(form?.getValue<T[]>(fieldPath));
    });

    return () => {
      unsubscribe?.();
    };
  }, [fieldPath, form]);

  const fieldPush = useCallback(
    (item: T) => {
      setValue((prev) => {
        const valueClone = cloneDeep(prev) || [];
        valueClone.push(item);
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
    value: value,
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
