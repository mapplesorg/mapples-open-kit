/** Sizes of the dot. */
export const LIVE_INDICATOR_SIZES = ['sm', 'md', 'lg'] as const;
export type LiveIndicatorSize = (typeof LIVE_INDICATOR_SIZES)[number];

/** Dot diameter per size. */
export const LIVE_INDICATOR_DOT: Record<LiveIndicatorSize, number> = {
  sm: 6,
  md: 8,
  lg: 12,
};

/** The ring that leaves the dot: it grows and fades, again and again. */
export const LIVE_INDICATOR_RING_KEYFRAMES = {
  from: { opacity: 0.6, transform: [{ scale: 1 }] },
  to: { opacity: 0, transform: [{ scale: 2.6 }] },
} as const;
