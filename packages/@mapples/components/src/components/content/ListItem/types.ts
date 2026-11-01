import { AVATAR_SHAPES, AvatarShape } from '../Avatar/types';

/** What the row shows at its start. */
export const LIST_ITEM_LEADINGS = [
  'none',
  'icon',
  'avatar',
  'image',
  'checkbox',
  'text',
] as const;
export type ListItemLeading = (typeof LIST_ITEM_LEADINGS)[number];

/** Outline of the leading avatar or photo (the Avatar shapes). */
export const LIST_ITEM_LEADING_SHAPES = AVATAR_SHAPES;
export type ListItemLeadingShape = AvatarShape;

/** What the row shows at its end. */
export const LIST_ITEM_TRAILINGS = [
  'none',
  'chevron',
  'text',
  'icon',
  'switch',
  'checkbox',
  'radio',
  'link',
  'badge',
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

/** Outer ring diameter of the trailing radio marker; the dot is half of it. */
export const LIST_ITEM_RADIO_DIAMETER = 20;
