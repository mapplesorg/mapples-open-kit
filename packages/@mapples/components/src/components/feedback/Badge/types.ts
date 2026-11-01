/** Badge presentations. */
export const BADGE_VARIANTS = ['dot', 'number', 'text'] as const;
export type BadgeVariant = (typeof BADGE_VARIANTS)[number];

/**
 * Badge colour treatments: `solid` the tone's main fill with contrast text,
 * `soft` the tone's tinted container with tone ink text, `outline` a
 * transparent pill with a tone border and ink text.
 */
export const BADGE_APPEARANCES = ['solid', 'soft', 'outline'] as const;
export type BadgeAppearance = (typeof BADGE_APPEARANCES)[number];

/** Badge heights. */
export const BADGE_SIZES = ['sm', 'md'] as const;
export type BadgeSize = (typeof BADGE_SIZES)[number];

export interface BadgeGeometry {
  /** Pill height — also its minimum width. */
  height: number;
  /** Dot diameter. */
  dot: number;
  /** Horizontal padding of the pill. */
  paddingX: number;
  /** Label font size. */
  fontSize: number;
  /** Label line height. */
  lineHeight: number;
  /** Leading glyph size (with `iconName`). */
  icon: number;
  /** Space between the glyph and the text. */
  gap: number;
}

/** Geometry per size. */
export const BADGE_GEOMETRY: Record<BadgeSize, BadgeGeometry> = {
  sm: {
    height: 16,
    dot: 8,
    paddingX: 6,
    fontSize: 10,
    lineHeight: 12,
    icon: 10,
    gap: 2,
  },
  md: {
    height: 20,
    dot: 10,
    paddingX: 6,
    fontSize: 11,
    lineHeight: 14,
    icon: 12,
    gap: 3,
  },
};

/** The text a badge shows for `count`, capped at `max` (`'99+'`). */
export const badgeCountText = (count: number, max: number): string =>
  count > max ? `${max}+` : String(count);
