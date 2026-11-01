import { parseDate, WEEK_STARTS, WeekStart } from '../../../internal';

/** First day of the week: `0` Sunday, `1` Monday. */
export const CALENDAR_HEATMAP_WEEK_STARTS = WEEK_STARTS;
export type CalendarHeatmapWeekStart = WeekStart;

/** Grid shapes: GitHub-style week columns, or one calendar month. */
export const CALENDAR_HEATMAP_LAYOUTS = ['weeks', 'month'] as const;
export type CalendarHeatmapLayout = (typeof CALENDAR_HEATMAP_LAYOUTS)[number];

/** One day of activity. */
export interface CalendarHeatmapDay {
  /** `'YYYY-MM-DD'`. */
  date: string;
  /** Intensity step, an integer from `0` to `levels - 1`; wins over `value`. */
  level?: number;
  /** A raw amount (minutes, reps), bucketed into `levels` steps by the data's largest value. */
  value?: number;
}

/** Defaults shared by the component and its canvas schematic. */
export const CALENDAR_HEATMAP_DEFAULTS = {
  weeks: 12,
  levels: 4,
  /** Cell edge of the `weeks` layout; the `month` layout stretches equal columns. */
  cellSize: 16,
  cellGap: 4,
} as const;

/** English one-letter weekday labels from Sunday. */
export const CALENDAR_HEATMAP_WEEKDAY_LABELS = [
  'S',
  'M',
  'T',
  'W',
  'T',
  'F',
  'S',
] as const;

/** Lightest and strongest tint of the in-between levels (the top level is the full fill). */
export const CALENDAR_HEATMAP_ALPHA = { min: 0.3, max: 1 } as const;

/**
 * The tint of `level` out of `levels`: `0` for the empty track, rising to
 * `1` (the full tone fill) at the top level.
 */
export const heatmapAlpha = (level: number, levels: number): number => {
  if (level <= 0) return 0;
  if (levels <= 2) return CALENDAR_HEATMAP_ALPHA.max;
  const { min, max } = CALENDAR_HEATMAP_ALPHA;
  return min + ((max - min) * (level - 1)) / (levels - 2);
};

/**
 * The level of every day in `data`, by day number. A malformed entry, a
 * duplicate date or an out-of-range level is a data error — it is reported,
 * never skipped. An entry with neither `level` nor `value` counts as the top
 * level (a done habit day).
 */
export const readHeatmapLevels = (
  data: unknown,
  levels: number,
  component: string,
): Map<number, number> => {
  const result = new Map<number, number>();
  if (data === undefined || data === null) return result;
  if (!Array.isArray(data)) {
    throw new Error(
      `${component}: data must be an array of {date, level?, value?}`,
    );
  }
  const entries = data.map((entry: unknown, index) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(
        `${component}: data[${index}] must be {date: 'YYYY-MM-DD', level?, value?}`,
      );
    }
    const { date, level, value } = entry as CalendarHeatmapDay;
    const day = parseDate(date, component, `data[${index}].date`);
    if (result.has(day)) {
      throw new Error(`${component}: data[${index}].date ${date} is repeated`);
    }
    result.set(day, 0);
    if (
      level !== undefined &&
      (!Number.isInteger(level) || level < 0 || level >= levels)
    ) {
      throw new Error(
        `${component}: data[${index}].level (${String(level)}) must be an integer from 0 to ${levels - 1}`,
      );
    }
    if (
      value !== undefined &&
      (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    ) {
      throw new Error(
        `${component}: data[${index}].value (${String(value)}) must be a finite number ≥ 0`,
      );
    }
    return { day, level, value };
  });
  const maxValue = entries.reduce(
    (largest, entry) =>
      entry.level === undefined && entry.value !== undefined
        ? Math.max(largest, entry.value)
        : largest,
    0,
  );
  const top = levels - 1;
  for (const { day, level, value } of entries) {
    if (level !== undefined) {
      result.set(day, level);
    } else if (value === undefined) {
      result.set(day, top);
    } else {
      result.set(
        day,
        value > 0 ? Math.max(1, Math.ceil((value / maxValue) * top)) : 0,
      );
    }
  }
  return result;
};
