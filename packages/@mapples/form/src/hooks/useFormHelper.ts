import { useMemo } from 'react';

import { first } from 'lodash';

import useForm from './useForm';

/**
 * Internal helper hook that extracts per-field error and touch state from the form context.
 * Used by `useFormField` and `useBindFormField` to avoid duplicating context-selection logic.
 *
 * @param fieldPath - Dot notation path to the field (e.g., `'user.name'`)
 * @returns Object containing the form instance, the first error message, all errors,
 *   the touched state flag, and the `validate` / `touch` helpers from the form context
 *
 * @internal
 */
const useFormHelper = (fieldPath: string) => {
  const { form, touched, validationErrors, validate, touch } = useForm();

  const errors = validationErrors?.[fieldPath];

  const error = useMemo(() => {
    return first(errors)?.message;
  }, [errors]);

  const isTouched = useMemo(() => {
    return !!touched[fieldPath as keyof typeof touched];
  }, [fieldPath, touched]);

  return {
    form,
    error,
    errors,
    isTouched,
    validate,
    touch,
  };
};

export default useFormHelper;
