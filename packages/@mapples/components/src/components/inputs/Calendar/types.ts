import { parseDate, WEEK_STARTS, WeekStart } from '../../../internal';

/** One date, or a start–end range (check-in / check-out). */
export const CALENDAR_MODES = ['single', 'range'] as const;
export type CalendarMode = (typeof CALENDAR_MODES)[number];

/** First day of the week: `0` Sunday, `1` Monday. */
export const CALENDAR_WEEK_STARTS = WEEK_STARTS;
export type CalendarWeekStart = WeekStart;

/** A date range; `''` marks a missing end (or both, for no range). */
export interface CalendarRange {
  /** `'YYYY-MM-DD'`, or `''` for no range. */
  start: string;
  /** `'YYYY-MM-DD'` on or after `start`, or `''` while only the start is picked. */
  end: string;
}

/** What the calendar reports: a date (`''` for none), or a {@link CalendarRange} in `range` mode. */
export type CalendarValue = string | CalendarRange;

/** English two-letter weekday labels from Sunday. */
export const CALENDAR_WEEKDAY_LABELS = [
  'Su',
  'Mo',
  'Tu',
  'We',
  'Th',
  'Fr',
  'Sa',
] as const;

/** Day-cell geometry in points. */
export const CALENDAR_GEOMETRY = {
  /** Edge of the day circle (and height of a week row and the range band). */
  day: 40,
  /** Edge of the previous/next month buttons. */
  nav: 40,
  /** Glyph size inside the month buttons. */
  navIcon: 20,
  /** Space between week rows. */
  rowGap: 4,
} as const;

/** A validated selection as day numbers (`undefined` where unset). */
export interface ResolvedCalendarSelection {
  start?: number;
  end?: number;
}

/**
 * The selection behind a value. A value of the wrong shape for the mode, a
 * malformed date, an end without a start or an end before the start is a
 * data error — it is reported, never ignored.
 */
export const readCalendarValue = (
  value: unknown,
  mode: CalendarMode,
  component: string,
): ResolvedCalendarSelection => {
  if (mode === 'single') {
    if (typeof value !== 'string') {
      throw new Error(
        `${component}: value must be a 'YYYY-MM-DD' string ('' for none) in single mode`,
      );
    }
    if (value === '') return {};
    const day = parseDate(value, component, 'value');
    return { start: day, end: day };
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(
      `${component}: value must be {start: 'YYYY-MM-DD' | '', end: 'YYYY-MM-DD' | ''} in range mode`,
    );
  }
  const { start, end } = value as CalendarRange;
  if (start === '' && end === '') return {};
  if (start === '') {
    throw new Error(`${component}: value.end (${end}) is set without a start`);
  }
  const startDay = parseDate(start, component, 'value.start');
  if (end === '') return { start: startDay };
  const endDay = parseDate(end, component, 'value.end');
  if (endDay < startDay) {
    throw new Error(
      `${component}: value.end (${end}) is before value.start (${start})`,
    );
  }
  return { start: startDay, end: endDay };
};

/** The disabled dates as day numbers; a malformed entry throws. */
export const readCalendarDisabledDates = (
  dates: unknown,
  component: string,
): Set<number> => {
  if (dates === undefined || dates === null) return new Set();
  if (!Array.isArray(dates)) {
    throw new Error(
      `${component}: disabledDates must be an array of 'YYYY-MM-DD' dates`,
    );
  }
  return new Set(
    dates.map((date: unknown, index) =>
      parseDate(date, component, `disabledDates[${index}]`),
    ),
  );
};

/** The empty selection of each mode. */
export const emptyCalendarValue = (mode: CalendarMode): CalendarValue =>
  mode === 'range' ? { start: '', end: '' } : '';
