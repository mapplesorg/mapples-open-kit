import { isValueSource, resolveValueSource } from '@mapples/state';
import type { SetStateFollowUp } from '@mapples/state';
import type { Action, ApiValueSource } from '@mapples/types';

/** The actions that reach the device rather than the app's own state. */
export const DeviceActionType = {
  /**
   * A touch of haptic feedback. `payload.data: { style?, then? }`; `style`
   * defaults to `selection`. Does nothing on the web.
   */
  Haptic: 'mapples:haptic',
  /**
   * Puts text on the clipboard. `payload.data: { text, then? }`: `text` is
   * a literal or a value source (`{ kind: 'state', dataProp: 'vars.code' }`).
   */
  Copy: 'mapples:copy',
  /**
   * Opens the system share sheet. `payload.data: { text?, url?, title?,
   * then? }`: `text` and `url` are literals or value sources; at least one
   * is needed. `then` runs once the sheet is done, unless it was dismissed.
   */
  Share: 'mapples:share',
} as const;

/** What a `mapples:haptic` can feel like. */
export const HAPTIC_STYLES = [
  'selection',
  'light',
  'medium',
  'heavy',
  'success',
  'warning',
  'error',
] as const;

export type HapticStyle = (typeof HAPTIC_STYLES)[number];

/** A resolved `mapples:haptic`. */
export interface HapticCommand {
  style: HapticStyle;
  then?: SetStateFollowUp;
}

/** A resolved `mapples:copy`. */
export interface CopyCommand {
  text: string;
  then?: SetStateFollowUp;
}

/** A resolved `mapples:share`. */
export interface ShareCommand {
  text?: string;
  url?: string;
  title?: string;
  then?: SetStateFollowUp;
}

type Data = Record<string, unknown>;

const isObject = (value: unknown): value is Data =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readFollowUp = (value: unknown): SetStateFollowUp | undefined =>
  isObject(value) && typeof value.type === 'string'
    ? (value as unknown as SetStateFollowUp)
    : undefined;

/**
 * A text of an action: a literal, or a value source resolved against the
 * action and the state. A number or a boolean reads as its text; nothing
 * (an unbound source, an empty string) is `undefined`.
 */
const readText = (
  value: unknown,
  action: Action,
  getStateValue: (path: string) => unknown,
): string | undefined => {
  const resolved = isValueSource(value)
    ? resolveValueSource(value as ApiValueSource, action, getStateValue)
    : value;
  if (typeof resolved === 'number' || typeof resolved === 'boolean') {
    return String(resolved);
  }
  return typeof resolved === 'string' && resolved !== '' ? resolved : undefined;
};

const dataOf = (action: Action): Data =>
  isObject(action.payload?.data) ? action.payload.data : {};

/**
 * Resolve a `mapples:haptic` action. Returns `null` for any other type; an
 * unknown style throws (a typo would otherwise be silence).
 */
export const toHapticCommand = (action: Action): HapticCommand | null => {
  if (action.type !== DeviceActionType.Haptic) return null;
  const data = dataOf(action);
  const style = data.style ?? 'selection';
  if (!(HAPTIC_STYLES as readonly unknown[]).includes(style)) {
    throw new Error(
      `A "${DeviceActionType.Haptic}" action has an unknown style ${JSON.stringify(style)}; use ${HAPTIC_STYLES.join(', ')}`,
    );
  }
  return { style: style as HapticStyle, then: readFollowUp(data.then) };
};

/**
 * Resolve a `mapples:copy` action. Returns `null` for any other type; one
 * with no text to copy throws.
 */
export const toCopyCommand = (
  action: Action,
  getStateValue: (path: string) => unknown,
): CopyCommand | null => {
  if (action.type !== DeviceActionType.Copy) return null;
  const data = dataOf(action);
  const text = readText(data.text, action, getStateValue);
  if (text === undefined) {
    throw new Error(
      `A "${DeviceActionType.Copy}" action has no text to copy (text is empty or its source resolved to nothing)`,
    );
  }
  return { text, then: readFollowUp(data.then) };
};

/**
 * Resolve a `mapples:share` action. Returns `null` for any other type; one
 * with neither text nor a url throws.
 */
export const toShareCommand = (
  action: Action,
  getStateValue: (path: string) => unknown,
): ShareCommand | null => {
  if (action.type !== DeviceActionType.Share) return null;
  const data = dataOf(action);
  const text = readText(data.text, action, getStateValue);
  const url = readText(data.url, action, getStateValue);
  if (text === undefined && url === undefined) {
    throw new Error(
      `A "${DeviceActionType.Share}" action has nothing to share (give it a text, a url or both)`,
    );
  }
  return {
    text,
    url,
    title: readText(data.title, action, getStateValue),
    then: readFollowUp(data.then),
  };
};
