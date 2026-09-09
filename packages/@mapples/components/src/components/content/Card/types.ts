/** Card surfaces. */
export const CARD_VARIANTS = ['elevated', 'filled', 'outlined'] as const;
export type CardVariant = (typeof CARD_VARIANTS)[number];
