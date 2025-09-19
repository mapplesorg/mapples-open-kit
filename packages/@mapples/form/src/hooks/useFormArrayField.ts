import { useContext, useEffect, useState } from 'react';

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
  const { form } = useContext(FormContext);

  const [value, setValue] = useState<T[] | undefined>();

  useEffect(() => {
    setValue(form?.getValue<T[]>(fieldPath));
  }, [fieldPath, form]);

  useEffect(() => {
    form?.setValue(fieldPath, value);
  }, [fieldPath, form, value]);

  const fieldPush = (item: T) => {
    setValue((prev) => [...(prev || []), item]);
  };

  const fieldDropLeft = (count?: number) => {
    setValue((prev) => drop(cloneDeep(prev), count));
  };

  const fieldDropRight = (count?: number) => {
    setValue((prev) => dropRight(cloneDeep(prev), count));
  };

  const fieldRemove = (index: number) => {
    setValue((prev) => {
      const valueClone = cloneDeep(prev);
      valueClone?.splice(index, 1);
      return valueClone;
    });
  };

  const fieldPaste = (item: T, index: number) => {
    setValue((prev) => {
      const valueClone = cloneDeep(prev);
      valueClone?.splice(index, 0, item);
      return valueClone;
    });
  };

  const fieldToggle = (item: T) => {
    const itemIndex = indexOf(value, item);
    if (itemIndex < 0) {
      fieldPush(item);
    } else {
      fieldRemove(itemIndex);
    }
  };

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
