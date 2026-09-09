import { useEffect, useState } from 'react';

import useForm from './useForm';

/**
 * Hook to manage boolean toggle fields.
 * This hook provides a simple way to handle boolean fields with toggle functionality.
 * The value follows the stored field (an existing `true` renders as on), not
 * only the toggles made through this hook.
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

  const [value, setValue] = useState<boolean>(
    () => !!form?.getValue<boolean | undefined>(fieldPath),
  );

  useEffect(() => {
    const unsubscribe = form?.subscribeOnChange<boolean | undefined>(
      (next) => setValue(!!next),
      fieldPath,
    );

    return () => {
      unsubscribe?.();
    };
  }, [fieldPath, form]);

  const handleToggleValue = () => {
    const nextValue = !value;
    setValue(nextValue);
    form?.setValue(fieldPath, nextValue);
  };

  return {
    value,
    toggleValue: handleToggleValue,
  };
};

export default useFormFieldToggle;
