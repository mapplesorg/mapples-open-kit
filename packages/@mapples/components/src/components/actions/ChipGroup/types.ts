/** Chip roles a group renders: `filter` chips toggle, `assist` chips fire once. */
export const CHIP_GROUP_VARIANTS = ['filter', 'assist'] as const;
export type ChipGroupVariant = (typeof CHIP_GROUP_VARIANTS)[number];

/**
 * How a group lays its chips out: `wrap` content-sized chips wrapping onto
 * new lines, `scroll` one horizontally scrolling line, `grid` equal-width
 * chips in `columns` columns.
 */
export const CHIP_GROUP_LAYOUTS = ['wrap', 'scroll', 'grid'] as const;
export type ChipGroupLayout = (typeof CHIP_GROUP_LAYOUTS)[number];

/** Column count of the `grid` layout when `columns` is unset. */
export const CHIP_GROUP_DEFAULT_COLUMNS = 3;

/** What a group reports: one value (`''` for none), or every selected value with `multiple`. */
export type ChipGroupValue = string | string[];
