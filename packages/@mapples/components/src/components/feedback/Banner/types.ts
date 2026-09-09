/** Banner colour roles — each has a matching structural glyph. */
export const BANNER_TONES = ['info', 'success', 'warning', 'error'] as const;
export type BannerTone = (typeof BANNER_TONES)[number];

/** Banner surfaces. */
export const BANNER_VARIANTS = ['tonal', 'filled', 'outlined'] as const;
export type BannerVariant = (typeof BANNER_VARIANTS)[number];

/** Size of the leading glyph. */
export const BANNER_GLYPH = 22;
