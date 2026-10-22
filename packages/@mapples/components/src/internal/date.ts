/**
 * @fileoverview Calendar-date arithmetic for the date components
 * (CalendarHeatmap, DayPicker). Dates are plain `'YYYY-MM-DD'` strings; in
 * between they are whole days since 1970-01-01 (a "day number"), so adding
 * days and reading weekdays never meets a timezone or a DST shift.
 */

const MS_PER_DAY = 86_400_000;

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;

/** English weekday names from Sunday — accessibility labels and defaults. */
export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/** English month names from January — accessibility labels. */
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** First day of a week: `0` Sunday, `1` Monday. */
export const WEEK_STARTS = [0, 1] as const;
export type WeekStart = (typeof WEEK_STARTS)[number];

/** The parts of a calendar date. */
export interface DateParts {
  year: number;
  /** 1–12. */
  month: number;
  /** 1–31. */
  day: number;
}

/**
 * The day number of a `'YYYY-MM-DD'` date. Throws on a malformed string or
 * a date that does not exist (`2026-02-30`), naming the component and field.
 */
export const parseDate = (
  date: unknown,
  component: string,
  field: string,
): number => {
  const match = typeof date === 'string' ? DATE_PATTERN.exec(date) : null;
  if (!match) {
    throw new Error(
      `${component}: ${field} (${String(date)}) must be a 'YYYY-MM-DD' date`,
    );
  }
  const [year, month, day] = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  ];
  const time = Date.UTC(year, month - 1, day);
  const check = new Date(time);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new Error(
      `${component}: ${field} (${String(date)}) is not a calendar date`,
    );
  }
  return Math.round(time / MS_PER_DAY);
};

/** The year and month (1–12) of a `'YYYY-MM'` string; throws when malformed. */
export const parseMonth = (
  month: unknown,
  component: string,
  field: string,
): { year: number; month: number } => {
  const match = typeof month === 'string' ? MONTH_PATTERN.exec(month) : null;
  const parsed = match
    ? { year: Number(match[1]), month: Number(match[2]) }
    : undefined;
  if (!parsed || parsed.month < 1 || parsed.month > 12) {
    throw new Error(
      `${component}: ${field} (${String(month)}) must be a 'YYYY-MM' month`,
    );
  }
  return parsed;
};

/** The day number of a year, month (1–12) and day. */
export const dayNumberOf = (year: number, month: number, day: number): number =>
  Math.round(Date.UTC(year, month - 1, day) / MS_PER_DAY);

/** The calendar parts of a day number. */
export const datePartsOf = (dayNumber: number): DateParts => {
  const date = new Date(dayNumber * MS_PER_DAY);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
};

/** The `'YYYY-MM-DD'` string of a day number. */
export const formatDate = (dayNumber: number): string => {
  const { year, month, day } = datePartsOf(dayNumber);
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/** Weekday of a day number: `0` Sunday … `6` Saturday. */
export const weekdayOf = (dayNumber: number): number =>
  // 1970-01-01 was a Thursday (4).
  (((dayNumber + 4) % 7) + 7) % 7;

/** The first day of the week holding `dayNumber`. */
export const startOfWeek = (dayNumber: number, weekStart: WeekStart): number =>
  dayNumber - ((weekdayOf(dayNumber) - weekStart + 7) % 7);

/** Days in a month (1–12) of a year. */
export const daysInMonth = (year: number, month: number): number =>
  dayNumberOf(year, month + 1, 1) - dayNumberOf(year, month, 1);

/** The device's local calendar date as a day number. */
export const localToday = (): number => {
  const now = new Date();
  return dayNumberOf(now.getFullYear(), now.getMonth() + 1, now.getDate());
};

/** A spoken date: "Monday, October 19, 2026". */
export const spokenDate = (dayNumber: number): string => {
  const { year, month, day } = datePartsOf(dayNumber);
  return `${WEEKDAY_NAMES[weekdayOf(dayNumber)]}, ${MONTH_NAMES[month - 1]} ${day}, ${year}`;
};

/**
 * Seven weekday labels from Sunday: the author's (validated) or `fallback`.
 */
export const readWeekdayLabels = (
  labels: unknown,
  fallback: readonly string[],
  component: string,
): readonly string[] => {
  if (labels === undefined || labels === null) return fallback;
  if (
    !Array.isArray(labels) ||
    labels.length !== 7 ||
    labels.some((label) => typeof label !== 'string')
  ) {
    throw new Error(
      `${component}: weekdayLabels must be 7 strings starting from Sunday`,
    );
  }
  return labels as string[];
};

/** `weekStart` validated (canvas values may arrive as any number). */
export const readWeekStart = (
  weekStart: unknown,
  component: string,
): WeekStart => {
  if (weekStart !== 0 && weekStart !== 1) {
    throw new Error(
      `${component}: weekStart (${String(weekStart)}) must be 0 (Sunday) or 1 (Monday)`,
    );
  }
  return weekStart;
};
