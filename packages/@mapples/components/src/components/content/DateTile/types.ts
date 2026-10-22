/** Tile sizes: ≈56×56, 56×64 and 64×84 points. */
export const DATE_TILE_SIZES = ['sm', 'md', 'lg'] as const;
export type DateTileSize = (typeof DATE_TILE_SIZES)[number];

/** Surfaces: a solid tone fill, a soft tone container, or a tone outline. */
export const DATE_TILE_VARIANTS = ['filled', 'tonal', 'outlined'] as const;
export type DateTileVariant = (typeof DATE_TILE_VARIANTS)[number];

/** Where the month label sits relative to the day number. */
export const DATE_TILE_MONTH_POSITIONS = ['top', 'bottom'] as const;
export type DateTileMonthPosition = (typeof DATE_TILE_MONTH_POSITIONS)[number];

/** Geometry of one tile size. */
export interface DateTileGeometry {
  /** Minimum tile width in points. */
  width: number;
  /** Minimum tile height in points (the time line may grow it). */
  height: number;
  /** Day-number font size. */
  day: number;
  /** Month-label font size. */
  month: number;
  /** Time-line font size. */
  time: number;
}

/**
 * Geometry per size — points, so a tile keeps its proportions whatever base
 * a project's sizing scale uses.
 */
export const DATE_TILE_GEOMETRY: Record<DateTileSize, DateTileGeometry> = {
  sm: { width: 56, height: 56, day: 22, month: 11, time: 10 },
  md: { width: 56, height: 64, day: 26, month: 12, time: 11 },
  lg: { width: 64, height: 84, day: 30, month: 13, time: 12 },
};
