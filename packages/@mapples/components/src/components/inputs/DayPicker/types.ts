import { Tone, TONES } from '@mapples/ui';

import { formatDate, parseDate } from '../../../internal';

/** One day at a time, or a set of days. */
export const DAY_PICKER_MODES = ['single', 'multiple'] as const;
export type DayPickerMode = (typeof DAY_PICKER_MODES)[number];

/** `date`: weekday over day number (event/booking strips); `weekday`: a weekday toggle (repeat on Mon–Sun). */
export const DAY_PICKER_DISPLAYS = ['date', 'weekday'] as const;
export type DayPickerDisplay = (typeof DAY_PICKER_DISPLAYS)[number];

/** One day cell. */
export interface DayPickerDay {
  /** `'YYYY-MM-DD'` — also the value the picker reports. */
  date: string;
  /** Replaces the weekday text of this cell ('Today'). */
  label?: string;
  /** A dot under the day: `true` in the picker's tone, or a tone of its own. */
  marker?: boolean | Tone;
  /** Muted, struck through and not pressable. */
  disabled?: boolean;
}

/** What the picker reports: one date (`''` for none), or a date array in `multiple` mode. */
export type DayPickerValue = string | string[];

/** English weekday names from Sunday. */
export const DAY_PICKER_WEEKDAY_LABELS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

/** Defaults shared by the component and its canvas schematic. */
export const DAY_PICKER_DEFAULTS = {
  count: 7,
} as const;

/** How many days `startDate` + `count` may generate. */
export const DAY_PICKER_MAX_COUNT = 366;

/**
 * Cell geometry per display; `width` applies while `scrollable` (otherwise
 * cells share the row equally) and the `weekday` height follows the
 * project's `md` control.
 */
export const DAY_PICKER_GEOMETRY = {
  date: { width: 52, height: 68 },
  weekday: { width: 44 },
  /** Space between cells. */
  gap: 8,
  /** Edge of the marker dot. */
  marker: 5,
} as const;

/** A validated day with its day number. */
export interface ResolvedDayPickerDay extends DayPickerDay {
  dayNumber: number;
}

/**
 * The days a picker renders. A malformed entry or a repeated date is a data
 * error — it is reported, never skipped.
 */
export const readDayPickerDays = (
  days: unknown,
  component: string,
): ResolvedDayPickerDay[] => {
  if (!Array.isArray(days)) {
    throw new Error(
      `${component}: days must be an array of {date, label?, marker?, disabled?}`,
    );
  }
  const seen = new Set<number>();
  return days.map((entry: unknown, index) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(
        `${component}: days[${index}] must be {date: 'YYYY-MM-DD', label?, marker?, disabled?}`,
      );
    }
    const day = entry as DayPickerDay;
    const dayNumber = parseDate(day.date, component, `days[${index}].date`);
    if (seen.has(dayNumber)) {
      throw new Error(
        `${component}: days[${index}].date ${day.date} is repeated`,
      );
    }
    seen.add(dayNumber);
    if (day.label !== undefined && typeof day.label !== 'string') {
      throw new Error(`${component}: days[${index}].label must be a string`);
    }
    if (
      day.marker !== undefined &&
      typeof day.marker !== 'boolean' &&
      !TONES.includes(day.marker)
    ) {
      throw new Error(
        `${component}: days[${index}].marker must be a boolean or one of ${TONES.join(', ')}`,
      );
    }
    if (day.disabled !== undefined && typeof day.disabled !== 'boolean') {
      throw new Error(
        `${component}: days[${index}].disabled must be a boolean`,
      );
    }
    return { ...day, dayNumber };
  });
};

/** `count` consecutive days from `start` (a day number). */
export const generateDayPickerDays = (
  start: number,
  count: number,
  component: string,
): ResolvedDayPickerDay[] => {
  if (!Number.isInteger(count) || count < 1 || count > DAY_PICKER_MAX_COUNT) {
    throw new Error(
      `${component}: count (${String(count)}) must be an integer from 1 to ${DAY_PICKER_MAX_COUNT}`,
    );
  }
  return Array.from({ length: count }, (_, index) => ({
    date: formatDate(start + index),
    dayNumber: start + index,
  }));
};

/** The selected dates behind either value shape. */
export const dayPickerSelection = (value: DayPickerValue): string[] =>
  Array.isArray(value) ? value : value === '' ? [] : [value];
