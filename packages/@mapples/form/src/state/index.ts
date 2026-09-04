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
  private readonly historyCoalesceMs: number;
  private lastHistoryWriteAt: number = 0;
  private historyDirty: boolean = false;
  private listenerSeq: number = 0;

  /**
   * Creates a new FormState instance.
   *
   * @param initialValues - The initial values for the form
   * @param validationSchema - Optional Yup validation schema
   * @param historyItems - Number of history items to keep for undo/redo (0 to disable)
   * @param historyItemThrottle - Throttle for saving history items (every Nth change)
   * @param filterHistoryKeys - Array of field paths to exclude from history tracking
   * @param historyCoalesceMs - Coalesce writes closer together than this into
   * one history entry (a typing or drag burst becomes a single undo step).
   * 0 keeps the counter-throttle behavior.
   */
  constructor(
    initialValues: T,
    validationSchema?: ObjectSchema<T>,
    historyItems: number = 0,
    historyItemThrottle: number = 5,
    filterHistoryKeys: string[] = [],
    historyCoalesceMs: number = 0,
  ) {
    this.values = cloneDeep(initialValues);
    this.validationSchema = validationSchema;
    this.historyItems = historyItems;
    this.historyItemThrottle = historyItemThrottle;
    this.filterHistoryKeys = filterHistoryKeys;
    this.historyCoalesceMs = historyCoalesceMs;

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
    this.finalizeStaleHistoryBurst();
    this.values = cloneDeep(values);
    this.saveToHistory();
    this.notifySubscriptions();
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

    this.finalizeStaleHistoryBurst();

    set(this.values, path, value);

    if (
      !some(this.filterHistoryKeys, (value) => {
        return path.includes(value);
      })
    ) {
      this.saveToHistory();
    }

    this.notifySubscriptions(path);
  }

  /**
   * Whether a write to `writePath` affects a subscriber at `subscriptionPath`.
   * Segment-aware in both directions: a write below the subscription changes
   * the subscribed value's contents; a write at or above it replaces the
   * subscribed value outright. Root subscribers (no path) see every write.
   * @private
   */
  private pathsIntersect(writePath: string, subscriptionPath?: string) {
    if (!subscriptionPath) return true;
    if (writePath === subscriptionPath) return true;
    if (writePath.startsWith(subscriptionPath + '.')) return true;
    if (subscriptionPath.startsWith(writePath + '.')) return true;
    return false;
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
    return cloneDeep(path ? get(this.values, path) : this.values) as V;
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

  /**
   * Commits the end state of a coalescing burst that has gone quiet. MUST run
   * before the next mutation lands in `this.values` — afterwards the burst's
   * true end state is gone. Called at the top of `setValue`/`setValues`, and
   * from `prev()` so an undo taken mid-burst leaves the burst redoable.
   * @private
   */
  private finalizeStaleHistoryBurst() {
    if (!this.historyDirty) return;
    if (Date.now() - this.lastHistoryWriteAt <= this.historyCoalesceMs) return;

    this.history[this.historyIndex] = cloneDeep(this.values);
    this.historyDirty = false;
  }

  private saveToHistory() {
    if (this.historyItems === 0) return;

    if (this.historyCoalesceMs > 0) {
      this.lastHistoryWriteAt = Date.now();

      // `finalizeStaleHistoryBurst` ran before this write landed, so a
      // still-dirty entry means this write continues the current burst: its
      // end state is captured when the burst finalizes. No clone, no compare.
      if (this.historyDirty) return;

      const currentValues = cloneDeep(this.values);

      if (
        this.history.length > 0 &&
        isEqual(this.history[this.historyIndex], currentValues)
      ) {
        return;
      }

      this.pushHistoryEntry(currentValues);
      this.historyDirty = true;
      return;
    }

    this.saveCounter++;
    if (this.saveCounter % this.historyItemThrottle !== 0) return;

    const currentValues = cloneDeep(this.values);

    const diff = isEqual(this.history[this.history.length - 1], currentValues);

    if (this.history.length > 0 && diff) {
      return;
    }

    this.pushHistoryEntry(currentValues);
  }

  private pushHistoryEntry(currentValues: T) {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(currentValues);

    if (this.history.length > this.historyItems) {
      this.history = this.history.slice(-this.historyItems);
    }
    this.historyIndex = this.history.length - 1;
  }

  /**
   * Moves to the previous state in the form history (undo operation).
   *
   * @returns True if the operation was successful, false if no previous state exists
   */
  prev() {
    // An undo mid-burst first commits the burst's end state, so a redo can
    // return to what the user actually last saw.
    if (this.historyDirty) {
      this.history[this.historyIndex] = cloneDeep(this.values);
      this.historyDirty = false;
    }

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

  /**
   * Delivers the current values to subscribers — all of them, or only those
   * whose path intersects `changedPath` when one is given.
   *
   * Cost discipline: the editor holds hundreds of subscriptions on one large
   * document, and this runs on every write. Pathed subscribers get a clone of
   * just their subtree; root subscribers share ONE lazily-created full clone
   * per pass. Subscribers must therefore treat delivered values as read-only.
   * Fresh clones (not `this.values` references) are still required so React
   * state setters see a new identity per delivery.
   * @private
   */
  private notifySubscriptions(changedPath?: string) {
    // Snapshot: callbacks may (un)subscribe or write back into the form
    // mid-pass; iterating the live map would tangle delivery with those
    // mutations.
    const subscribers = Array.from(this.subscriptions.values());

    let fullClone: T | undefined;

    for (const subscription of subscribers) {
      if (
        changedPath !== undefined &&
        !this.pathsIntersect(changedPath, subscription.path)
      ) {
        continue;
      }

      if (subscription.path) {
        subscription.cb(cloneDeep(get(this.values, subscription.path)));
      } else {
        fullClone ??= cloneDeep(this.values);
        subscription.cb(fullClone);
      }
    }
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
    // Monotonic — timestamp+random ids could collide, silently replacing a
    // live subscription in the Map and orphaning its callback.
    return `listener-${++this.listenerSeq}`;
  }
}

export default FormState;
