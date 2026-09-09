/** Chip roles a group renders: `filter` chips toggle, `assist` chips fire once. */
export const CHIP_GROUP_VARIANTS = ['filter', 'assist'] as const;
export type ChipGroupVariant = (typeof CHIP_GROUP_VARIANTS)[number];

/** What a group reports: one value (`''` for none), or every selected value with `multiple`. */
export type ChipGroupValue = string | string[];
