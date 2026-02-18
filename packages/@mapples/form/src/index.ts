import FormState from './state';

/**
 * @packageDocumentation
 * @module @mapples/form
 *
 * Form management for React and React Native: type-safe state, Yup validation,
 * form history (undo/redo), reactive subscriptions, and hook-based field API.
 *
 * @example
 * ```tsx
 * import { Form, useFormField, useFormSubmit } from '@mapples/form';
 * import * as yup from 'yup';
 *
 * const schema = yup.object({
 *   name: yup.string().required('Name is required'),
 *   email: yup.string().email().required('Email is required'),
 * });
 *
 * const MyForm = () => (
 *   <Form
 *     initialValues={{ name: '', email: '' }}
 *     validationSchema={schema}
 *     onSubmit={async (values) => {
 *       console.log('Form submitted:', values);
 *     }}
 *   >
 *     <NameField />
 *     <EmailField />
 *     <SubmitButton />
 *   </Form>
 * );
 * ```
 *
 * @public
 */

// Export all types
export * from './types';

// Export all components
export * from './components';

// Export all hooks
export * from './hooks';

// Export FormState class for advanced usage
export { FormState };
