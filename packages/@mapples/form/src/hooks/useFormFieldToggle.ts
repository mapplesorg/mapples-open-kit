import { useContext, useEffect, useState } from 'react';

import FormContext from '../context';

const useFormFieldToggle = (fieldPath: string) => {
  const { form } = useContext(FormContext);

  const [value, setValue] = useState(false);

  useEffect(() => {
    setValue(form?.getValue<boolean>(fieldPath) || false);
  }, [fieldPath, form]);

  const handleToggleValue = () => {
    setValue((prev) => {
      const nextValue = !prev;
      form?.setValue(fieldPath, nextValue);
      return nextValue;
    });
  };

  return {
    value,
    toggleValue: handleToggleValue,
  };
};

export default useFormFieldToggle;
