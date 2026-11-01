/**
 * @fileoverview Private time arithmetic of TimePicker — times are 24-hour
 * `'HH:mm'` strings, in between minutes since midnight.
 */

/** Minutes in a day. */
export const MINUTES_PER_DAY = 24 * 60;

const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

/**
 * Minutes since midnight of an `'HH:mm'` (24-hour) string. Throws on a
 * malformed string or an hour/minute out of range, naming the field.
 */
export const parseTime = (
  time: unknown,
  component: string,
  field: string,
): number => {
  const match = typeof time === 'string' ? TIME_PATTERN.exec(time) : null;
  const hours = match ? Number(match[1]) : NaN;
  const minutes = match ? Number(match[2]) : NaN;
  if (!match || hours > 23 || minutes > 59) {
    throw new Error(
      `${component}: ${field} (${String(time)}) must be an 'HH:mm' 24-hour time`,
    );
  }
  return hours * 60 + minutes;
};

/** The `'HH:mm'` string of minutes since midnight. */
export const formatTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** `minuteStep` validated: an integer from 1 to 30 that divides 60. */
export const readMinuteStep = (step: unknown, component: string): number => {
  if (
    typeof step !== 'number' ||
    !Number.isInteger(step) ||
    step < 1 ||
    step > 30 ||
    60 % step !== 0
  ) {
    throw new Error(
      `${component}: minuteStep (${String(step)}) must be an integer from 1 to 30 that divides 60`,
    );
  }
  return step;
};

/** The pickable window: the first and last on-step minutes inside min/max. */
export interface TimeWindow {
  low: number;
  high: number;
}

/**
 * The first and last times on the minute step inside `minTime`–`maxTime`
 * (the whole day when unset). Throws when min is after max or no step fits.
 */
export const readTimeWindow = (
  minTime: string | undefined,
  maxTime: string | undefined,
  step: number,
  component: string,
): TimeWindow => {
  const min =
    minTime === undefined ? 0 : parseTime(minTime, component, 'minTime');
  const max =
    maxTime === undefined
      ? MINUTES_PER_DAY - 1
      : parseTime(maxTime, component, 'maxTime');
  if (min > max) {
    throw new Error(
      `${component}: minTime (${String(minTime)}) is after maxTime (${String(maxTime)})`,
    );
  }
  const low = Math.ceil(min / step) * step;
  const high = Math.floor(max / step) * step;
  if (low > high) {
    throw new Error(
      `${component}: no time between minTime and maxTime falls on the ${step}-minute step`,
    );
  }
  return { low, high };
};

/** The time nearest to `minutes` inside the window (on-step input stays on step). */
export const clampTime = (minutes: number, window: TimeWindow): number =>
  Math.min(window.high, Math.max(window.low, minutes));

/** One option of a column. */
export interface TimeColumnOption {
  /** Shown text. */
  label: string;
  /** Spoken text ("7 hours", "30 minutes", "PM"). */
  accessibilityLabel: string;
  /** Muted and not pickable (outside minTime/maxTime). */
  disabled: boolean;
}
