/** Divider directions. */
export const DIVIDER_ORIENTATIONS = ['horizontal', 'vertical'] as const;
export type DividerOrientation = (typeof DIVIDER_ORIENTATIONS)[number];
