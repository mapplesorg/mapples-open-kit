import { Ref } from 'react';

import { ObjectSchema, ValidationError } from 'yup';

import FormState from '../state';

/**
 * Represents any possible value type that can be stored in a form field.
 * @public
 */
export type AnyValue = string | number | object | boolean | null | symbol;

/**
 * Callback function type for form value subscriptions.
 * @template T - The type of value being subscribed to
 * @param value - The current value
 * @public
 */
export type SubscriptionCallBack<T> = (value: T) => void;

/**
 * Configuration for subscribing to form value changes.
 * @template T - The type of value being subscribed to
 * @public
 */
export interface ValueSubscription<T = AnyValue> {
  /** Optional path to a specific field. If not provided, subscribes to the entire form */
  path?: string;
  /** Callback function to execute when the value changes */
  cb: SubscriptionCallBack<T>;
}

/**
 * Context type that provides form state and methods to child components.
 * @template T - The type of the form data object
 * @public
 */
export interface FormContextType<T extends object> {
  /** The form state instance containing all form data and methods */
  form: FormState<T>;
  /** Object tracking which fields have been touched by the user */
  touched: Record<keyof T, boolean>;
  /** Function to submit the form, triggering validation and onSubmit callback */
  submitForm: () => void;
  /** Boolean indicating if the form is currently being submitted */
  submitting: boolean;
  /** Validation errors organized by field path */
  validationErrors: Record<string, ValidationError[]> | null;
  /** Function to validate the form without submitting */
  validate: () => void;
  /** Function to mark a specific field as touched */
  touch: (fieldName: string) => void;
}

/**
 * Props for the Form component.
 * @template T - The type of the form data object
 * @public
 */
export interface FormProps<T extends object> {
  /** Initial values for the form fields */
  initialValues: T;
  /** Optional Yup validation schema for form validation */
  validationSchema?: ObjectSchema<T>;
  /** Callback function called when the form is successfully submitted */
  onSubmit?: (value: T) => void | Promise<void>;
  /**
   * Optional ref to access the FormState instance directly. Accepts either a
   * ref object or a callback ref — a callback is the only way for a consumer
   * to observe REMOUNTS of the form (a ref object mutates silently).
   */
  ref?: Ref<FormState<T> | null>;
  /** Number of history items to keep for undo/redo functionality (0 to disable) */
  historyItems?: number;
  /** Throttle for saving history items (every Nth change) */
  historyItemThrottle?: number;
  /** Array of field paths to exclude from history tracking */
  filterHistoryKeys?: string[];
  /** Callback function called whenever form values change */
  onChange?: (value: T) => void;
}
