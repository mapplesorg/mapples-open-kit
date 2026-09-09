/** Skeleton shapes. */
export const SKELETON_VARIANTS = ['text', 'rect', 'circle'] as const;
export type SkeletonVariant = (typeof SKELETON_VARIANTS)[number];

/** Default height per variant (a circle takes its width). */
export const SKELETON_HEIGHT = { text: 16, rect: 80 } as const;

/** Default edge of a circle. */
export const SKELETON_CIRCLE_EDGE = 40;

/** Width of the last of several text lines, as a fraction of the block. */
export const SKELETON_LAST_LINE = 0.6;
