import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { first } from 'lodash';

import FormContext from '../context';

const useFormField = <T>(
  fieldPath: string,
  fallbackValue?: T,
  subscribe?: boolean,
) => {
  const { form, touched, validationErrors, validate, touch } =
    useContext(FormContext);

  const [value, setValue] = useState<T | undefined>(fallbackValue);

  const errors = validationErrors?.[fieldPath];

  const error = useMemo(() => {
    return first(errors)?.message;
  }, [errors]);

  const isTouched = useMemo(() => {
    return !!touched[fieldPath as keyof typeof touched];
  }, [fieldPath, touched]);

  useEffect(() => {
    setValue(form?.getValue<T>(fieldPath) || fallbackValue);
  }, [fallbackValue, fieldPath, form]);

  useEffect(() => {
    if (!subscribe) {
      const unsubscribe = form?.subscribeOnHistoryChange(() => {
        setValue(form?.getValue<T>(fieldPath) || fallbackValue);
      });

      return () => {
        unsubscribe?.();
      };
    }

    const unsubscribe = form?.subscribeOnChange<T>(setValue, fieldPath);

    return () => {
      unsubscribe?.();
    };
  }, [fallbackValue, fieldPath, form, subscribe]);

  const handleSetValue = useCallback(
    (newValue: T) => {
      form?.setValue(fieldPath, newValue);
      if (!subscribe) {
        setValue(newValue);
      }
    },
    [fieldPath, form, subscribe],
  );

  return {
    value,
    error,
    errors,
    isTouched,
    validate,
    touch,
    setValue: handleSetValue,
  };
};

export default useFormField;
