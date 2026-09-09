/** Star sizes. */
export const RATING_SIZES = ['sm', 'md', 'lg'] as const;
export type RatingSize = (typeof RATING_SIZES)[number];

/** Star edge per size. */
export const RATING_STAR: Record<RatingSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};
