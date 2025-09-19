import { RefObject } from 'react';

import { ObjectSchema, ValidationError } from 'yup';

import FormState from '../state';

export type AnyValue = string | number | object | boolean | null | symbol;

export type SubscriptionCallBack<T> = (value: T) => void;

export interface ValueSubscription<T = AnyValue> {
  path?: string;
  cb: SubscriptionCallBack<T>;
}

export interface FormContextType<T extends object> {
  form: FormState<T> | null;
  touched: Record<keyof T, boolean>;
  submitForm: () => void;
  submitting: boolean;
  validationErrors: Record<string, ValidationError[]> | null;
  validate: () => void;
  touch: (fieldName: string) => void;
}

export interface FormProps<T extends object> {
  initialValues: T;
  validationSchema?: ObjectSchema<T>;
  onSubmit?: (value: T) => void | Promise<void>;
  ref?: RefObject<FormState<T> | null>;
  historyItems?: number;
  historyItemThrottle?: number;
  filterHistoryKeys?: string[];
  onChange?: (value: T) => void;
}
