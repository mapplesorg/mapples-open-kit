import { cloneDeep, get, has, set, groupBy, isEqual, some } from 'lodash';
import { ObjectSchema, ValidationError } from 'yup';

import type {
  AnyValue,
  SubscriptionCallBack,
  ValueSubscription,
} from '../types';

/**
 * FormState manages the state of a form including values, validation, history, and subscriptions.
 * It provides methods to get/set values, validate data, manage history for undo/redo functionality,
 * and subscribe to value changes.
 *
 * @template T - The type of the form data object
 * @public
 */
class FormState<T extends object> {
  private values: T;

  private validationSchema?: ObjectSchema<T>;
  private subscriptions: Map<string, ValueSubscription> = new Map();
  private formHistorySubscriptions: Map<string, () => void> = new Map();
  private errors: Record<string, ValidationError[]> | null = null;

  private history: T[] = [];
  private historyIndex: number = -1;
  private readonly historyItems: number;
  private readonly historyItemThrottle: number;
  private saveCounter: number = 0;
  private readonly filterHistoryKeys: string[];

  /**
   * Creates a new FormState instance.
   *
   * @param initialValues - The initial values for the form
   * @param validationSchema - Optional Yup validation schema
   * @param historyItems - Number of history items to keep for undo/redo (0 to disable)
   * @param historyItemThrottle - Throttle for saving history items (every Nth change)
   * @param filterHistoryKeys - Array of field paths to exclude from history tracking
   */
  constructor(
    initialValues: T,
    validationSchema?: ObjectSchema<T>,
    historyItems: number = 0,
    historyItemThrottle: number = 5,
    filterHistoryKeys: string[] = [],
  ) {
    this.values = cloneDeep(initialValues);
    this.validationSchema = validationSchema;
    this.historyItems = historyItems;
    this.historyItemThrottle = historyItemThrottle;
    this.filterHistoryKeys = filterHistoryKeys;

    if (this.historyItems > 0) {
      this.history = [cloneDeep(initialValues)];
      this.historyIndex = 0;
    }
  }

  /**
   * Gets a deep copy of all form values.
   *
   * @returns A deep copy of the current form values
   */
  getValues() {
    return cloneDeep(this.values);
  }

  /**
   * Sets validation errors for the form.
   *
   * @param errors - Validation errors organized by field path
   */
  setErrors(errors: Record<string, ValidationError[]>) {
    this.errors = errors;
  }

  /**
   * Gets the current validation errors.
   *
   * @returns Current validation errors or null if no errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Sets all form values and triggers subscriptions.
   *
   * @param values - New values to set for the form
   * @param cb - Optional callback invoked with `true` after the values and subscriptions have been updated
   */
  setValues(values: T, cb?: (success: boolean) => void) {
    this.values = cloneDeep(values);
    this.saveToHistory();

    this.subscriptions.forEach((subscription) => {
      subscription.cb(
        subscription.path
          ? get(this.getValues(), subscription.path)
          : this.getValues(),
      );
    });
    cb?.(true);
  }

  /**
   * Sets a value at a specific path and triggers subscriptions.
   *
   * @template V - The type of value being set
   * @param path - Dot notation path to the field (e.g., 'user.name')
   * @param value - The value to set at the specified path
   */
  setValue<V>(path: string, value?: V) {
    // `set` builds every missing segment of the path. That is what makes
    // writing a nested field work, but it also means a write to a path that
    // no longer exists FABRICATES the structure it names. Field paths do go
    // stale — a subscriber keeps the path it was created with, and the node
    // it points at can move or be removed before the subscription is torn
    // down. Writing `undefined` there has nothing to clear, so the only
    // effect would be that fabricated structure: refuse it.
    if (value === undefined && !has(this.values, path)) {
      return;
    }

    set(this.values, path, value);

    if (
      !some(this.filterHistoryKeys, (value) => {
        return path.includes(value);
      })
    ) {
      this.saveToHistory();
    }

    this.subscriptions.forEach((subscription) => {
      if (!path.includes(subscription.path || '')) {
        return;
      }

      subscription.cb(
        subscription.path
          ? get(this.getValues(), subscription.path)
          : this.getValues(),
      );
    });
  }

  /**
   * Subscribes to form value changes.
   *
   * @template V - The type of value being subscribed to
   * @param cb - Callback function to execute when values change
   * @param path - Optional path to subscribe to a specific field
   * @returns Unsubscribe function to remove the subscription
   */
  subscribeOnChange<V>(cb: SubscriptionCallBack<V>, path?: string) {
    const id = this.generateListenerId();

    this.subscriptions.set(id, {
      cb: cb as SubscriptionCallBack<AnyValue>,
      path,
    });

    cb(this.getValue(path));

    return this.unsubscribeOnChange(id);
  }

  /**
   * Subscribes to form history changes (undo/redo operations).
   *
   * @param cb - Callback function to execute when history changes
   * @returns Unsubscribe function to remove the subscription
   */
  subscribeOnHistoryChange(cb: () => void) {
    const id = this.generateListenerId();

    this.formHistorySubscriptions.set(id, cb);

    return this.unsubscribeOnHistoryChange(id);
  }

  /**
   * Gets a value at a specific path or all values if no path is provided.
   *
   * @template V - The type of value to return
   * @param path - Optional dot notation path to the field
   * @returns The value at the specified path or all form values
   */
  getValue<V>(path?: string): V {
    return cloneDeep(path ? get(this.getValues(), path) : this.getValues());
  }

  /**
   * Validates the form using the provided validation schema.
   *
   * @throws Throws validation errors if validation fails
   */
  async validate() {
    try {
      await this.validationSchema?.validate(this.getValues(), {
        abortEarly: false,
      });
    } catch (error) {
      const errors = this.remapValidationError(error as ValidationError);
      this.setErrors(errors);
      throw errors;
    }
  }

  private saveToHistory() {
    if (this.historyItems === 0) return;

    this.saveCounter++;
    if (this.saveCounter % this.historyItemThrottle !== 0) return;

    const currentValues = cloneDeep(this.values);

    const diff = isEqual(this.history[this.history.length - 1], currentValues);

    if (this.history.length > 0 && diff) {
      return;
    }

    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(currentValues);

    if (this.history.length > this.historyItems) {
      this.history = this.history.slice(-this.historyItems);
      this.historyIndex = this.history.length - 1;
    } else {
      this.historyIndex = this.history.length - 1;
    }
  }

  /**
   * Moves to the previous state in the form history (undo operation).
   *
   * @returns True if the operation was successful, false if no previous state exists
   */
  prev() {
    if (!this.canPrev()) return false;
    this.historyIndex--;
    this.values = cloneDeep(this.history[this.historyIndex]);
    this.notifySubscriptions();
    this.notifyHistorySubscriptions();
    return true;
  }

  /**
   * Moves to the next state in the form history (redo operation).
   *
   * @returns True if the operation was successful, false if no next state exists
   */
  next() {
    if (!this.canNext()) return false;
    this.historyIndex++;
    this.values = cloneDeep(this.history[this.historyIndex]);
    this.notifySubscriptions();
    this.notifyHistorySubscriptions();
    return true;
  }

  /**
   * Checks if there is a previous state available for undo operation.
   *
   * @returns True if undo operation is possible
   */
  canPrev() {
    return this.historyItems > 0 && this.historyIndex > 0;
  }

  /**
   * Checks if there is a next state available for redo operation.
   *
   * @returns True if redo operation is possible
   */
  canNext() {
    return this.historyItems > 0 && this.historyIndex < this.history.length - 1;
  }

  private notifySubscriptions() {
    this.subscriptions.forEach((subscription) => {
      subscription.cb(
        subscription.path
          ? get(this.getValues(), subscription.path)
          : this.getValues(),
      );
    });
  }

  private notifyHistorySubscriptions() {
    this.formHistorySubscriptions.forEach((callback) => {
      callback();
    });
  }

  private remapValidationError(error: ValidationError) {
    return groupBy(error.inner, 'path');
  }

  private unsubscribeOnChange(id: string) {
    return () => this.subscriptions.delete(id);
  }

  private unsubscribeOnHistoryChange(id: string) {
    return () => this.formHistorySubscriptions.delete(id);
  }

  private generateListenerId(): string {
    const date = new Date().getTime().toString(36);
    const random = Math.random().toString(36).substring(2, 15);

    return `${date}-${random}`;
  }
}

export default FormState;
