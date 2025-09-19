import { useContext, useEffect, useState } from 'react';

import FormContext from '../context';

const useFormValue = <T>(fieldPath?: string) => {
  const { form } = useContext(FormContext);

  const [value, setValue] = useState<T>();

  useEffect(() => {
    setValue(form?.getValue(fieldPath));
  }, [fieldPath, form]);

  useEffect(() => {
    const unsubscribe = form?.subscribeOnChange<T>(setValue, fieldPath);

    return () => {
      unsubscribe?.();
    };
  }, [fieldPath, form]);

  return value;
};

export default useFormValue;
