/** Row heights. */
export const DRAWER_ITEMS_DENSITIES = ['comfortable', 'compact'] as const;
export type DrawerItemsDensity = (typeof DRAWER_ITEMS_DENSITIES)[number];

/** Row height per density. */
export const DRAWER_ITEMS_ROW_HEIGHT: Record<DrawerItemsDensity, number> = {
  comfortable: 48,
  compact: 40,
};

/** Glyph size. */
export const DRAWER_ITEMS_ICON_SIZE = 24;
