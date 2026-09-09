/** What the row shows at its start. */
export const LIST_ITEM_LEADINGS = ['none', 'icon', 'avatar', 'image'] as const;
export type ListItemLeading = (typeof LIST_ITEM_LEADINGS)[number];

/** What the row shows at its end. */
export const LIST_ITEM_TRAILINGS = [
  'none',
  'chevron',
  'text',
  'icon',
  'switch',
  'checkbox',
] as const;
export type ListItemTrailing = (typeof LIST_ITEM_TRAILINGS)[number];

/** Row heights. */
export const LIST_ITEM_SIZES = ['sm', 'md', 'lg'] as const;
export type ListItemSize = (typeof LIST_ITEM_SIZES)[number];

/** Colour roles of the row text. */
export const LIST_ITEM_TONES = ['default', 'error'] as const;
export type ListItemTone = (typeof LIST_ITEM_TONES)[number];

/** Minimum row height per size. */
export const LIST_ITEM_HEIGHT: Record<ListItemSize, number> = {
  sm: 44,
  md: 56,
  lg: 72,
};
