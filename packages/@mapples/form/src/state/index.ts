import { cloneDeep, get, set, groupBy, isEqual, some } from 'lodash';
import { ObjectSchema, ValidationError } from 'yup';

import type {
  AnyValue,
  SubscriptionCallBack,
  ValueSubscription,
} from '../types';

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

  getValues() {
    return cloneDeep(this.values);
  }

  setErrors(errors: Record<string, ValidationError[]>) {
    this.errors = errors;
  }

  getErrors() {
    return this.errors;
  }

  setValues(values: T) {
    this.values = cloneDeep(values);
    this.saveToHistory();
    this.subscriptions.forEach((subscription) => {
      subscription.cb(
        subscription.path
          ? get(this.getValues(), subscription.path)
          : this.getValues(),
      );
    });
  }

  setValue<V>(path: string, value?: V) {
    set(this.values, path, value);

    if (
      !some(this.filterHistoryKeys, (value) => {
        return path.includes(value);
      })
    ) {
      this.saveToHistory();
    }
    this.subscriptions.forEach((subscription) => {
      subscription.cb(
        subscription.path
          ? get(this.getValues(), subscription.path)
          : this.getValues(),
      );
    });
  }

  subscribeOnChange<V>(cb: SubscriptionCallBack<V>, path?: string) {
    const id = this.generateListenerId();

    this.subscriptions.set(id, {
      cb: cb as SubscriptionCallBack<AnyValue>,
      path,
    });

    return this.unsubscribeOnChange(id);
  }

  subscribeOnHistoryChange(cb: () => void) {
    const id = this.generateListenerId();

    this.formHistorySubscriptions.set(id, cb);

    return this.unsubscribeOnHistoryChange(id);
  }

  getValue<V>(path?: string): V {
    return cloneDeep(path ? get(this.getValues(), path) : this.getValues());
  }

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

  prev() {
    if (!this.canPrev()) return false;
    this.historyIndex--;
    this.values = cloneDeep(this.history[this.historyIndex]);
    this.notifySubscriptions();
    this.notifyHistorySubscriptions();
    return true;
  }

  next() {
    if (!this.canNext()) return false;
    this.historyIndex++;
    this.values = cloneDeep(this.history[this.historyIndex]);
    this.notifySubscriptions();
    this.notifyHistorySubscriptions();
    return true;
  }

  canPrev() {
    return this.historyItems > 0 && this.historyIndex > 0;
  }

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
