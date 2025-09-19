import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
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

  const form = useRef<FormState<T>>(
    new FormState(
      initialValues,
      validationSchema,
      historyItems,
      historyItemThrottle,
      filterHistoryKeys,
    ),
  ).current;

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

  useEffect(() => {
    form.setValues(initialValues);
  }, [form, initialValues]);

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

    try {
      await onSubmit?.(form.getValues());
    } catch (e) {
      console.error(e);
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
