import { Tone, TONES } from '@mapples/ui';

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

/** The edge a swipe action is revealed at: `end` is the right in a left-to-right app. */
export const LIST_ITEM_SWIPE_SIDES = ['end', 'start'] as const;
export type ListItemSwipeSide = (typeof LIST_ITEM_SWIPE_SIDES)[number];

/** One action a swipe on the row reveals. */
export interface ListItemSwipeAction {
  /** What `onSwipeAction` fires with ('delete', 'archive'). */
  value: string;
  /** Text under (or instead of) the glyph. */
  label?: string;
  /** Glyph (project icon family). */
  iconName?: string;
  /** Fill colour role. Defaults to `error` for the value `delete`, otherwise `primary`. */
  tone?: Tone;
  /** The edge it is revealed at. Defaults to `end`. */
  side?: ListItemSwipeSide;
}

/** Width of one revealed swipe action, in points. */
export const LIST_ITEM_SWIPE_ACTION_WIDTH = 72;

/** At most this many actions per side: more do not fit beside a row. */
export const LIST_ITEM_SWIPE_MAX_PER_SIDE = 3;

const SWIPE_ACTION_SHAPE =
  `{value: string, label?: string, iconName?: string, tone?: ${TONES.join(' | ')}, ` +
  "side?: 'end' | 'start'} with label or iconName";

/**
 * The swipe actions a row renders. Absent or empty means the row does not
 * swipe. A malformed entry is a data error: it throws, naming the entry.
 */
export const readListItemSwipeActions = (
  actions: unknown,
): ListItemSwipeAction[] => {
  if (actions === undefined || actions === null) return [];
  if (!Array.isArray(actions)) {
    throw new Error(
      `ListItem: swipeActions must be an array of ${SWIPE_ACTION_SHAPE}`,
    );
  }
  actions.forEach((action, index) => {
    const entry = (
      typeof action === 'object' && action !== null ? action : {}
    ) as Record<string, unknown>;
    const { value, label, iconName, tone, side } = entry;
    const valid =
      typeof value === 'string' &&
      value !== '' &&
      (label === undefined || typeof label === 'string') &&
      (iconName === undefined || typeof iconName === 'string') &&
      (!!label || !!iconName) &&
      (tone === undefined || (TONES as readonly unknown[]).includes(tone)) &&
      (side === undefined ||
        (LIST_ITEM_SWIPE_SIDES as readonly unknown[]).includes(side));
    if (!valid) {
      throw new Error(
        `ListItem: swipeActions[${index}] must be ${SWIPE_ACTION_SHAPE}`,
      );
    }
  });
  const list = actions as ListItemSwipeAction[];
  for (const side of LIST_ITEM_SWIPE_SIDES) {
    const count = list.filter(
      (action) => (action.side ?? 'end') === side,
    ).length;
    if (count > LIST_ITEM_SWIPE_MAX_PER_SIDE) {
      throw new Error(
        `ListItem: at most ${LIST_ITEM_SWIPE_MAX_PER_SIDE} swipeActions per side (${count} at the ${side})`,
      );
    }
  }
  return list;
};
