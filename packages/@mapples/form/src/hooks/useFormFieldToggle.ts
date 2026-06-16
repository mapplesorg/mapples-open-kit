import { useState } from 'react';

import useForm from './useForm';

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
  const { form } = useForm();

  const [value, setValue] = useState(false);

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
