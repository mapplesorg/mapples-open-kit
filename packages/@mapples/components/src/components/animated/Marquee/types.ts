/** Which way the content of a `Marquee` travels. */
export const MARQUEE_DIRECTIONS = ['left', 'right'] as const;

export type MarqueeDirection = (typeof MARQUEE_DIRECTIONS)[number];

/** How fast the content travels by default, in points per second. */
export const MARQUEE_SPEED = 40;

/** The space between one run of the content and the next, in points. */
export const MARQUEE_GAP = 24;
