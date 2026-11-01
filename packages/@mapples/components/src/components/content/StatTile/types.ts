import { CARD_VARIANTS } from '../Card/types';

/** Direction of the change a tile reports. */
export const STAT_TILE_TRENDS = ['up', 'down', 'flat', 'none'] as const;
export type StatTileTrend = (typeof STAT_TILE_TRENDS)[number];

/** Text alignment inside the tile. */
export const STAT_TILE_ALIGNS = ['left', 'center'] as const;
export type StatTileAlign = (typeof STAT_TILE_ALIGNS)[number];

/**
 * Surface treatments: `Card`'s set plus `plain` (no surface, border, shadow
 * or padding — for spec strips and stats laid out inline).
 */
export const STAT_TILE_VARIANTS = [...CARD_VARIANTS, 'plain'] as const;
export type StatTileVariant = (typeof STAT_TILE_VARIANTS)[number];

/** Where the glyph sits: at the end of the label row, or right before the value ('🔥 12'). */
export const STAT_TILE_ICON_PLACEMENTS = ['header', 'value'] as const;
export type StatTileIconPlacement = (typeof STAT_TILE_ICON_PLACEMENTS)[number];

/** Where the caption sits: on its own line under the trend, or inline after it. */
export const STAT_TILE_TREND_PLACEMENTS = ['row', 'inline'] as const;
export type StatTileTrendPlacement =
  (typeof STAT_TILE_TREND_PLACEMENTS)[number];

/** Trend glyph: a chevron (up/down) or a diagonal arrow (up-right/down-right). */
export const STAT_TILE_TREND_ICONS = ['chevron', 'arrow'] as const;
export type StatTileTrendIcon = (typeof STAT_TILE_TREND_ICONS)[number];

/** Glyph size in the header. */
export const STAT_TILE_HEADER_ICON = 20;

/** Glyph size before the value. */
export const STAT_TILE_VALUE_ICON = 24;

/** Trend glyph size. */
export const STAT_TILE_TREND_ICON = 16;
