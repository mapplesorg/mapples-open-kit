import { CARD_VARIANTS, CardVariant } from '../Card/types';

/** Direction of the change a tile reports. */
export const STAT_TILE_TRENDS = ['up', 'down', 'flat', 'none'] as const;
export type StatTileTrend = (typeof STAT_TILE_TRENDS)[number];

/** Text alignment inside the tile. */
export const STAT_TILE_ALIGNS = ['left', 'center'] as const;
export type StatTileAlign = (typeof STAT_TILE_ALIGNS)[number];

/** Surface treatments (the same set as `Card`). */
export const STAT_TILE_VARIANTS = CARD_VARIANTS;
export type StatTileVariant = CardVariant;
