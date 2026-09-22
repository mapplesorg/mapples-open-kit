import { Action, ApiValueSource } from '@mapples/types';
import { get, isPlainObject } from 'lodash';

const SOURCE_KINDS: ReadonlySet<string> = new Set([
  'static',
  'state',
  'event',
  'data',
]);

/** Whether a value is an {@link ApiValueSource} rather than a literal. */
export const isValueSource = (value: unknown): value is ApiValueSource =>
  isPlainObject(value) &&
  SOURCE_KINDS.has((value as { kind?: string }).kind ?? '');

/**
 * Resolve one {@link ApiValueSource} against the action that triggered it.
 * Shared by every runtime that takes authored values at emit time — a
 * request's params and body, a navigate action's route params.
 *
 * - `static` — the literal.
 * - `state` — `getStateValue(dataProp)`, a `@mapples/state` lookup where the
 *   handler is mounted (`vars.*`, `api.*`, the focused screen's `route.*`).
 *   `undefined` without a resolver.
 * - `event` — the event's own first argument (form values, input text), not
 *   `payload.data`: that one is merged with `staticData`, so it drops a
 *   non-object argument and mixes the action's config into the rest.
 * - `data` — `payload.data`: what the element resolved in its own scope (a
 *   list row's item when it binds `(this)`) merged with its `staticData`, or a
 *   route's params for an on-enter action — values a root-mounted `state`
 *   lookup can't see.
 */
export const resolveValueSource = (
  source: ApiValueSource,
  action: Action,
  getStateValue?: (path: string) => unknown,
): unknown => {
  switch (source.kind) {
    case 'static':
      return source.value;
    case 'state':
      return getStateValue?.(source.dataProp);
    case 'event': {
      const payload: unknown = action.payload?.originalEventData?.[0];
      return source.path ? get(payload, source.path) : payload;
    }
    case 'data': {
      const payload: unknown = action.payload?.data;
      return source.path ? get(payload, source.path) : payload;
    }
  }
};
