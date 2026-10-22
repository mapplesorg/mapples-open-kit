/** `24h`: hours 00–23; `12h`: hours 1–12 plus an AM/PM column. */
export const TIME_PICKER_FORMATS = ['24h', '12h'] as const;
export type TimePickerFormat = (typeof TIME_PICKER_FORMATS)[number];

/** Defaults shared by the component and its canvas schematic. */
export const TIME_PICKER_DEFAULTS = {
  minuteStep: 5,
  periodLabels: ['AM', 'PM'] as [string, string],
} as const;

/** Column geometry in points. */
export const TIME_PICKER_GEOMETRY = {
  /** Height of one option row — also the snap interval. */
  item: 40,
  /** Rows visible in a column (odd, so one sits in the middle). */
  visible: 5,
  /** Width of a column. */
  column: 64,
  /** Width of the `:` between hours and minutes. */
  separator: 12,
  /** Space between columns. */
  gap: 4,
} as const;
