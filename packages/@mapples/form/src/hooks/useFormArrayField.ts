import { useContext, useEffect, useState } from 'react';

import { cloneDeep, drop, dropRight, indexOf } from 'lodash';

import FormContext from '../context';

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
