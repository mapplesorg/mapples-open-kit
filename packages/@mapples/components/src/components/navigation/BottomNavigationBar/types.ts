/** When item labels show. */
export const BOTTOM_NAVIGATION_LABEL_VISIBILITIES = [
  'always',
  'selected',
  'never',
] as const;
export type BottomNavigationLabelVisibility =
  (typeof BOTTOM_NAVIGATION_LABEL_VISIBILITIES)[number];

/** Bar treatments: flush with the bottom edge, or a floating pill. */
export const BOTTOM_NAVIGATION_VARIANTS = ['plain', 'floating'] as const;
export type BottomNavigationVariant =
  (typeof BOTTOM_NAVIGATION_VARIANTS)[number];

/**
 * The mark on the active destination: a pill behind the glyph, a short bar
 * on the item's top edge, a dot under the label, or none (colour only).
 */
export const BOTTOM_NAVIGATION_INDICATORS = [
  'pill',
  'bar',
  'dot',
  'none',
] as const;
export type BottomNavigationIndicator =
  (typeof BOTTOM_NAVIGATION_INDICATORS)[number];

/** One destination of the bar. */
export interface BottomNavigationItem {
  /** Visible text under the glyph (or in its place when there is no glyph). */
  label: string;
  /** The value the bar reports. */
  value: string;
  /** Glyph from the project icon family. Omit for a label-only item. */
  iconName?: string;
  /** Glyph while active (the filled twin); defaults to `iconName`. */
  activeIconName?: string;
  /** Count pinned to the glyph (next to the label on a label-only item); hidden at 0. */
  badgeCount?: number;
}

/** Fewest destinations a bar holds. */
export const BOTTOM_NAVIGATION_MIN_ITEMS = 3;

/** Most destinations a bar holds. */
export const BOTTOM_NAVIGATION_MAX_ITEMS = 5;

/** Bar height without the safe area. */
export const BOTTOM_NAVIGATION_HEIGHT = 64;

/** Outer margin of the floating variant. */
export const BOTTOM_NAVIGATION_FLOATING_MARGIN = 16;

/** The active pill behind the glyph. */
export const BOTTOM_NAVIGATION_INDICATOR = { width: 64, height: 32 } as const;

/** The `bar` indicator on the active item's top edge. */
export const BOTTOM_NAVIGATION_BAR_INDICATOR = {
  width: 32,
  height: 3,
} as const;

/** Diameter of the `dot` indicator under the active label. */
export const BOTTOM_NAVIGATION_DOT_SIZE = 4;

/** Default glyph size. */
export const BOTTOM_NAVIGATION_ICON_SIZE = 24;

const isOptional = (value: unknown, type: 'string' | 'number'): boolean =>
  value === undefined || typeof value === type;

/** `true` when `value` is a well-formed destination. */
export const isBottomNavigationItem = (
  value: unknown,
): value is BottomNavigationItem => {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  const hasIcon = typeof item.iconName === 'string' && item.iconName !== '';
  return (
    typeof item.label === 'string' &&
    typeof item.value === 'string' &&
    isOptional(item.iconName, 'string') &&
    isOptional(item.activeIconName, 'string') &&
    isOptional(item.badgeCount, 'number') &&
    // A filled twin needs the glyph it replaces.
    (item.activeIconName === undefined || hasIcon) &&
    // Something has to show: a glyph, a label, or both.
    (hasIcon || item.label !== '')
  );
};

const ITEM_SHAPE =
  '{label: string, value: string, iconName?: string, activeIconName?: string, badgeCount?: number} with a non-empty label or iconName (activeIconName only next to iconName)';

/**
 * The destinations a bar renders. A malformed entry or a count outside 3–5
 * is a data error — it is reported, never silently fixed, so an author sees
 * what to change.
 */
export const readBottomNavigationItems = (
  items: unknown,
): BottomNavigationItem[] => {
  if (!Array.isArray(items)) {
    throw new Error(
      `BottomNavigationBar: items must be an array of ${ITEM_SHAPE}`,
    );
  }
  if (
    items.length < BOTTOM_NAVIGATION_MIN_ITEMS ||
    items.length > BOTTOM_NAVIGATION_MAX_ITEMS
  ) {
    throw new Error(
      `BottomNavigationBar: between ${BOTTOM_NAVIGATION_MIN_ITEMS} and ${BOTTOM_NAVIGATION_MAX_ITEMS} items are required (got ${items.length})`,
    );
  }
  items.forEach((item, index) => {
    if (!isBottomNavigationItem(item)) {
      throw new Error(
        `BottomNavigationBar: items[${index}] must be ${ITEM_SHAPE}`,
      );
    }
  });
  return items as BottomNavigationItem[];
};
