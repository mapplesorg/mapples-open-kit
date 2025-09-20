import FormState from './state';

/**
 * @mapples/form - A comprehensive form management library for React and React Native
 *
 * This package provides a powerful and flexible form state management solution with:
 * - Type-safe form handling with TypeScript support
 * - Yup validation integration
 * - Form history management (undo/redo functionality)
 * - Reactive form state with subscription-based updates
 * - Comprehensive hook-based API for form field management
 * - Support for nested objects and arrays
 * - Touch state tracking for better UX
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
