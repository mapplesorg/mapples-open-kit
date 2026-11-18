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
  /** Takes every element equal to the value out of an array variable. */
  | 'remove'
  /** Adds the value to an array variable, or takes it out when it is already in. */
  | 'toggleItem'
  | 'clear';

/** One authored write, carried in `actionProps.<trigger>.staticData`. */
export interface SetStateOperation {
  /** Target path including the namespace, e.g. `vars.count`, `vars.form.email`. */
  target: string;
  /** Defaults to `'set'`. */
  op?: SetStateOp;
  /** Required for `set`/`append`/`remove`/`toggleItem`; optional amount for `increment`/`decrement`. */
  source?: StateValueSource;
}

export const StateActionType = {
  /** Write variables. `payload.data: { operations: SetStateOperation[] }`. */
  SetState: 'mapples:setState',
} as const;

/**
 * The action re-emitted once every operation of a `mapples:setState` has
 * been applied — `{ type: 'mapples:navigate', data: { routeName } }` lets a
 * sign-in button set the session and move on in one press. Carried in
 * `staticData.onDone`, the way a request carries `onSuccess`.
 */
export interface SetStateFollowUp {
  type: string;
  data?: unknown;
  /** Literal payload merged over `data`, as on an element's action. */
  staticData?: Record<string, unknown>;
}

/**
 * The `payload.data` a follow-up action goes out with. Follow-ups can be
 * written like the element action they chain from (`staticData`) or in the
 * short form (`data`), so both reach the handler.
 */
export const followUpData = (
  followUp: Pick<SetStateFollowUp, 'data' | 'staticData'>,
): unknown =>
  followUp.staticData
    ? {
        ...(isPlainObject(followUp.data)
          ? (followUp.data as Record<string, unknown>)
          : {}),
        ...followUp.staticData,
      }
    : followUp.data;

/** The follow-up a `mapples:setState` action carries, if any. */
export const setStateFollowUp = (action: Action): SetStateFollowUp | null => {
  const onDone = (action.payload?.data as { onDone?: unknown } | undefined)
    ?.onDone;
  return isPlainObject(onDone) &&
    typeof (onDone as { type?: unknown }).type === 'string'
    ? (onDone as SetStateFollowUp)
    : null;
};

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

export const ConditionActionType = {
  /**
   * Choose a follow-up by a condition on the state. `payload.data:
   * { condition, then?, else? }` — `condition` is a `@mapples/inlang`
   * condition (`api.signIn.status::eq::401`, `vars.picks::isNotEmpty::`),
   * `then` and `else` follow-ups like a request's `onSuccess`. The chosen
   * one goes out with the triggering action's event, so an `event` source
   * in it still reads the same arguments.
   */
  If: 'mapples:if',
} as const;

/** A resolved `mapples:if`: the condition and its branches. */
export interface ConditionCommand {
  condition: string;
  then?: SetStateFollowUp;
  else?: SetStateFollowUp;
}

const asFollowUp = (value: unknown): SetStateFollowUp | undefined =>
  isPlainObject(value) && typeof (value as { type?: unknown }).type === 'string'
    ? (value as SetStateFollowUp)
    : undefined;

/**
 * Resolve a `mapples:if` action into a {@link ConditionCommand}. Returns
 * `null` for any other action type; a `mapples:if` without a condition
 * throws — a branch that silently never runs is a wiring defect nobody can
 * see.
 */
export const toConditionCommand = (action: Action): ConditionCommand | null => {
  if (action.type !== ConditionActionType.If) return null;
  const data = (action.payload?.data ?? {}) as {
    condition?: unknown;
    then?: unknown;
    else?: unknown;
  };
  if (typeof data.condition !== 'string' || data.condition === '') {
    throw new Error(`A "${ConditionActionType.If}" action has no condition`);
  }
  return {
    condition: data.condition,
    then: asFollowUp(data.then),
    else: asFollowUp(data.else),
  };
};

export const DelayActionType = {
  /**
   * Wait, then go on. `payload.data: { duration, then }`: `duration` is
   * milliseconds as a number or a time (`'1800ms'`, `'1.8s'`), `then` a
   * follow-up like a request's `onSuccess`. A "Copied" label that flips back
   * is `setState` → `onDone: delay` → `then: setState`. The follow-up goes
   * out with the triggering action's event.
   */
  Delay: 'mapples:delay',
} as const;

/** A resolved `mapples:delay`: how long to wait and what follows. */
export interface DelayCommand {
  /** Milliseconds. */
  duration: number;
  then: SetStateFollowUp;
}

/** The longest a `mapples:delay` waits: one minute. A longer wait is a timer, not a step. */
export const DELAY_MAX_DURATION = 60000;

const readDuration = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return undefined;
  const match = /^(\d*\.?\d+)(ms|s)?$/.exec(value.trim());
  if (!match) return undefined;
  return Number(match[1]) * (match[2] === 's' ? 1000 : 1);
};

/**
 * Resolve a `mapples:delay` action into a {@link DelayCommand}. Returns
 * `null` for any other action type. A delay without a valid duration or
 * without a follow-up throws: a step that silently never continues is a
 * wiring defect nobody can see.
 */
export const toDelayCommand = (action: Action): DelayCommand | null => {
  if (action.type !== DelayActionType.Delay) return null;
  const data = (action.payload?.data ?? {}) as {
    duration?: unknown;
    then?: unknown;
  };
  const duration = readDuration(data.duration);
  if (
    duration === undefined ||
    !Number.isFinite(duration) ||
    duration < 0 ||
    duration > DELAY_MAX_DURATION
  ) {
    throw new Error(
      `A "${DelayActionType.Delay}" action needs a duration from 0 to ${DELAY_MAX_DURATION} ms ('1800ms', '1.8s' or a number), got ${JSON.stringify(data.duration)}`,
    );
  }
  const then = asFollowUp(data.then);
  if (!then) {
    throw new Error(
      `A "${DelayActionType.Delay}" action has no "then" follow-up to run after the wait`,
    );
  }
  return { duration, then };
};
