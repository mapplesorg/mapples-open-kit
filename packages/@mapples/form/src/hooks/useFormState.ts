import { useCallback, useContext, useEffect, useState } from 'react';

import FormContext from '../context';

const useFormState = <T extends object>() => {
  const [values, setFormValues] = useState<T>();

  const { form } = useContext(FormContext);

  useEffect(() => {
    const unsubscribe = form?.subscribeOnChange<T>((values) => {
      setFormValues(values);
    });
    return () => {
      unsubscribe?.();
    };
  }, [form]);

  const setValues = useCallback(
    (values: T) => {
      form?.setValues(values);
    },
    [form],
  );

  const getValues = useCallback(() => {
    return form?.getValues() as T | undefined;
  }, [form]);

  return {
    values,
    setValues,
    getValues,
  };
};

export default useFormState;
