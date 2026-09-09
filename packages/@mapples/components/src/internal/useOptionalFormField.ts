import { useCallback } from 'react';

import { useFormField } from '@mapples/form';

export interface OptionalFormField<T> {
  /** Whether the control is bound to a form field. */
  bound: boolean;
  /** The form value (undefined while unbound). */
  value: T | undefined;
  /** Writes the form value (no-op while unbound). */
  setValue: (next: T) => void;
  /** The field's first validation error once it has been touched. */
  error: string | undefined;
  /** Marks the field touched (call on blur). */
  touch: () => void;
}

/**
 * Binds a control to the nearest `FormView` field when `fieldName` is set.
 * Without a `fieldName` the control stays a plain controlled/uncontrolled
 * component — the form context is always present (a default form exists
 * outside any FormView), so the name is the only switch.
 */
const useOptionalFormField = <T>(
  fieldName: string | undefined,
): OptionalFormField<T> => {
  const bound = !!fieldName;
  const field = useFormField<T>(fieldName ?? '__unbound__');

  const setValue = useCallback(
    (next: T) => {
      if (bound) field.setValue(next);
    },
    [bound, field],
  );
  const touch = useCallback(() => {
    if (bound && fieldName) field.touch(fieldName);
  }, [bound, field, fieldName]);

  return {
    bound,
    value: bound ? field.value : undefined,
    setValue,
    error: bound && field.isTouched ? field.error : undefined,
    touch,
  };
};

export default useOptionalFormField;
