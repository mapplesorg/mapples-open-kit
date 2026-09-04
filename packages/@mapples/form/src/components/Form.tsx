import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import { mapValues } from 'lodash';
import { ValidationError } from 'yup';

import { FormContextProvider } from '../context';
import FormState from '../state';
import { FormProps } from '../types';

/**
 * Form component that provides form state management, validation, and submission functionality.
 * It creates a FormState instance and provides it to child components through React Context.
 *
 * @template T - The type of the form data object
 * @param props - Form component props
 * @param props.children - Child components that will have access to the form context
 * @param props.initialValues - Initial values for the form fields
 * @param props.validationSchema - Optional Yup validation schema
 * @param props.onSubmit - Callback invoked with form values after successful validation
 * @param props.ref - Optional ref to access the FormState instance directly
 * @param props.historyItems - Number of history states to keep for undo/redo (0 to disable)
 * @param props.historyItemThrottle - Save a history entry every Nth change
 * @param props.historyCoalesceMs - Coalesce write bursts into one history entry
 * @param props.filterHistoryKeys - Field paths to exclude from history tracking
 * @param props.onChange - Callback invoked whenever any form value changes
 * @returns JSX element that provides form context to children
 *
 * @example
 * ```tsx
 * interface UserForm {
 *   name: string;
 *   email: string;
 * }
 *
 * const MyForm = () => (
 *   <Form<UserForm>
 *     initialValues={{ name: '', email: '' }}
 *     validationSchema={userSchema}
 *     onSubmit={async (values) => {
 *       await saveUser(values);
 *     }}
 *   >
 *     <FormField name="name" />
 *     <FormField name="email" />
 *     <SubmitButton />
 *   </Form>
 * );
 * ```
 *
 * @public
 */
const Form = <T extends object>({
  children,
  initialValues,
  validationSchema,
  onSubmit,
  ref,
  historyItems,
  filterHistoryKeys,
  historyItemThrottle,
  historyCoalesceMs,
  onChange,
}: PropsWithChildren<FormProps<T>>) => {
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>,
  );

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<
    string,
    ValidationError[]
  > | null>(null);

  // Lazy state init creates the FormState exactly once and keeps the same
  // instance for the component's lifetime. Unlike useMemo, it never re-creates
  // when initialValues/schema change identity (e.g. inline object literals on
  // every parent render), which would otherwise wipe edited values back to the
  // initial state. We never call the setter, so this never triggers a re-render.
  const [form] = useState(
    () =>
      new FormState(
        initialValues,
        validationSchema,
        historyItems,
        historyItemThrottle,
        filterHistoryKeys,
        historyCoalesceMs,
      ),
  );

  useEffect(() => {
    if (!onChange) return;

    const unsubscribe = form.subscribeOnChange(() => {
      onChange(form.getValues());
    });

    return () => {
      unsubscribe();
    };
  }, [form, onChange]);

  useImperativeHandle(ref, () => {
    return form;
  });

  const setFormTouched = useCallback(() => {
    setTouched(mapValues(initialValues, () => true));
  }, [initialValues]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setFormTouched();

    try {
      await form.validate();
      setValidationErrors(null);
    } catch (errors) {
      setValidationErrors(errors as Record<string, ValidationError[]>);
      setSubmitting(false);
      return;
    }

    // `onSubmit` belongs to the consumer: it is responsible for reporting its
    // own failures. Anything that escapes it is a real fault and must reach the
    // caller rather than being swallowed here — `finally` only clears the
    // submitting flag.
    try {
      await onSubmit?.(form.getValues());
    } finally {
      setSubmitting(false);
    }
  }, [form, onSubmit, setFormTouched]);

  const validate = useCallback(async () => {
    try {
      await form.validate();
      setValidationErrors(null);
    } catch (errors) {
      setValidationErrors(errors as Record<string, ValidationError[]>);
    }
  }, [form]);

  const touch = useCallback((fieldName: string) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  }, []);

  return (
    <FormContextProvider
      value={{
        touched,
        form: form as FormState<object>,
        submitForm: handleSubmit,
        submitting,
        validationErrors,
        validate,
        touch,
      }}
    >
      {children}
    </FormContextProvider>
  );
};

export default Form;
