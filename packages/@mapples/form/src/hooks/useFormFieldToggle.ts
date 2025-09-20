import { useContext, useEffect, useState } from 'react';

import FormContext from '../context';

/**
 * Hook to manage boolean toggle fields.
 * This hook provides a simple way to handle boolean fields with toggle functionality.
 *
 * @param fieldPath - Dot notation path to the boolean field
 * @returns Object containing current value and toggle function
 *
 * @example
 * ```tsx
 * const ToggleField = () => {
 *   const { value, toggleValue } = useFormFieldToggle('isActive');
 *
 *   return (
 *     <label>
 *       <input
 *         type="checkbox"
 *         checked={value}
 *         onChange={toggleValue}
 *       />
 *       Active
 *     </label>
 *   );
 * };
 * ```
 *
 * @public
 */
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
