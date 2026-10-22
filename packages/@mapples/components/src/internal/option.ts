/**
 * One selectable entry of an `options` list (ChipGroup, RadioGroup,
 * SegmentedControl, SelectField, ActionSheet).
 */
export interface Option {
  /** Visible text. */
  label: string;
  /** The value the control reports. */
  value: string;
  /** Optional glyph from the project icon family. */
  iconName?: string;
  /** Supporting text where the control shows one (RadioGroup). */
  description?: string;
  /** Trailing detail where the control shows one, such as a price (RadioGroup). */
  meta?: string;
  /** Not selectable. */
  disabled?: boolean;
  /** Painted in the error tone (ActionSheet). */
  destructive?: boolean;
}

/** `true` when `value` is a well-formed option. */
export const isOption = (value: unknown): value is Option =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Option).label === 'string' &&
  typeof (value as Option).value === 'string';

/**
 * The options a control renders. A malformed entry is a data error — it is
 * reported, never silently skipped, so an author sees which item is wrong.
 */
export const readOptions = (options: unknown, component: string): Option[] => {
  if (options === undefined || options === null) return [];
  if (!Array.isArray(options)) {
    throw new Error(`${component}: options must be an array of {label, value}`);
  }
  options.forEach((option, index) => {
    if (!isOption(option)) {
      throw new Error(
        `${component}: options[${index}] must be {label: string, value: string}`,
      );
    }
  });
  return options as Option[];
};
