/** Layout of the radio rows. */
export const RADIO_GROUP_DIRECTIONS = ['column', 'row'] as const;
export type RadioGroupDirection = (typeof RADIO_GROUP_DIRECTIONS)[number];

/** Sizes of the radio circle. */
export const RADIO_GROUP_SIZES = ['sm', 'md', 'lg'] as const;
export type RadioGroupSize = (typeof RADIO_GROUP_SIZES)[number];

/** Outer circle diameter per size; the dot is half of it. */
export const RADIO_DIAMETER: Record<RadioGroupSize, number> = {
  sm: 18,
  md: 20,
  lg: 24,
};

/** Option surfaces: plain rows or a bordered card per option. */
export const RADIO_GROUP_VARIANTS = ['list', 'card'] as const;
export type RadioGroupVariant = (typeof RADIO_GROUP_VARIANTS)[number];
