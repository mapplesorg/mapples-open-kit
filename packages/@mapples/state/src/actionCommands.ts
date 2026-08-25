import { Action } from '@mapples/types';
import { get, isPlainObject } from 'lodash';

/** How a `mapples:setState` operation produces its value. */
export type StateValueSource =
  /** A typed literal. */
  | { kind: 'static'; value: string | number | boolean | null }
  /** Another state path — scope state, `api.*` responses or `vars.*`. */
  | { kind: 'state'; dataProp: string }
  /**
   * From the trigger's `originalEventData[index ?? 0]` (e.g. the text of an
   * `onChangeText`), optionally narrowed by `path`.
   */
  | { kind: 'event'; index?: number; path?: string };

export type SetStateOp =
  | 'set'
  | 'increment'
  | 'decrement'
  | 'toggle'
  | 'append'
  | 'clear';

/** One authored write, carried in `actionProps.<trigger>.staticData`. */
export interface SetStateOperation {
  /** Target path including the namespace, e.g. `vars.count`, `vars.form.email`. */
  target: string;
  /** Defaults to `'set'`. */
  op?: SetStateOp;
  /** Required for `set`/`append`; optional amount for `increment`/`decrement`. */
  source?: StateValueSource;
}

export const StateActionType = {
  /** Write variables. `payload.data: { operations: SetStateOperation[] }`. */
  SetState: 'mapples:setState',
} as const;

/** A resolved write, ready to apply against the writable store. */
export interface SetStateCommand {
  target: string;
  op: SetStateOp;
  /** Resolved source value (absent for `toggle`/`clear`, and for unsourced increments). */
  value?: unknown;
}

/** Everything value resolution may need at emit time. */
export interface SetStateResolutionContext {
  /** Resolves `state`-kind value sources (a `@mapples/state` lookup). */
  getStateValue?: (path: string) => unknown;
}

const isOperation = (value: unknown): value is SetStateOperation =>
  isPlainObject(value) &&
  typeof (value as { target?: unknown }).target === 'string';

const resolveSource = (
  source: StateValueSource | undefined,
  action: Action,
  context: SetStateResolutionContext,
): unknown => {
  if (!source) return undefined;
  switch (source.kind) {
    case 'static':
      return source.value;
    case 'state':
      return context.getStateValue?.(source.dataProp);
    case 'event': {
      const event = action.payload?.originalEventData?.[source.index ?? 0];
      return source.path ? get(event, source.path) : event;
    }
  }
};

/**
 * Resolve a `mapples:setState` action into executable commands. Returns
 * `null` for any other action type or a malformed payload. Pure — pass the
 * state lookup via `context` (same pattern as `toRequestCommand` /
 * `toNavigationCommand`).
 */
export const toSetStateCommands = (
  action: Action,
  context: SetStateResolutionContext = {},
): SetStateCommand[] | null => {
  if (action.type !== StateActionType.SetState) return null;

  const operations = (
    action.payload?.data as { operations?: unknown[] } | undefined
  )?.operations;
  if (!Array.isArray(operations)) return null;

  const commands: SetStateCommand[] = [];
  for (const operation of operations) {
    if (!isOperation(operation)) continue;
    commands.push({
      target: operation.target,
      op: operation.op ?? 'set',
      value: resolveSource(operation.source, action, context),
    });
  }

  return commands.length ? commands : null;
};
