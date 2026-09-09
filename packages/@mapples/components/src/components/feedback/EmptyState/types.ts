/** EmptyState sizes — the vertical padding around the content. */
export const EMPTY_STATE_SIZES = ['sm', 'md', 'lg'] as const;
export type EmptyStateSize = (typeof EMPTY_STATE_SIZES)[number];

/** Vertical padding per size. */
export const EMPTY_STATE_PADDING: Record<EmptyStateSize, number> = {
  sm: 24,
  md: 40,
  lg: 64,
};

/** Geometry of the illustration area. */
export const EMPTY_STATE_GEOMETRY = {
  /** Edge of the tinted circle behind the glyph. */
  iconCircle: 72,
  /** Glyph size. */
  icon: 32,
  /** Height of an image illustration. */
  imageHeight: 160,
  /** Width cap of the image, title and message. */
  contentWidth: 320,
} as const;
