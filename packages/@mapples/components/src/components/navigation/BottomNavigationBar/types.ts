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

/** One destination of the bar. */
export interface BottomNavigationItem {
  /** Visible text under the glyph. */
  label: string;
  /** The value the bar reports. */
  value: string;
  /** Glyph from the project icon family. */
  iconName: string;
  /** Glyph while active (the filled twin); defaults to `iconName`. */
  activeIconName?: string;
  /** Count pinned to the glyph; hidden at 0. */
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

/** Glyph size. */
export const BOTTOM_NAVIGATION_ICON_SIZE = 24;

/** `true` when `value` is a well-formed destination. */
export const isBottomNavigationItem = (
  value: unknown,
): value is BottomNavigationItem =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as BottomNavigationItem).label === 'string' &&
  typeof (value as BottomNavigationItem).value === 'string' &&
  typeof (value as BottomNavigationItem).iconName === 'string' &&
  ((value as BottomNavigationItem).activeIconName === undefined ||
    typeof (value as BottomNavigationItem).activeIconName === 'string') &&
  ((value as BottomNavigationItem).badgeCount === undefined ||
    typeof (value as BottomNavigationItem).badgeCount === 'number');

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
      'BottomNavigationBar: items must be an array of {label, value, iconName, activeIconName?, badgeCount?}',
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
        `BottomNavigationBar: items[${index}] must be {label: string, value: string, iconName: string, activeIconName?: string, badgeCount?: number}`,
      );
    }
  });
  return items as BottomNavigationItem[];
};
