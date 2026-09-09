/** Indicator styles. */
export const TABS_VARIANTS = ['underline', 'pill'] as const;
export type TabsVariant = (typeof TABS_VARIANTS)[number];

/** Tab heights. */
export const TABS_SIZES = ['sm', 'md'] as const;
export type TabsSize = (typeof TABS_SIZES)[number];

/** One tab. */
export interface TabItem {
  /** Visible text. */
  label: string;
  /** The value the tabs report. */
  value: string;
  /** Glyph before the label (project icon family). */
  iconName?: string;
  /** Count after the label; hidden at 0. */
  badgeCount?: number;
}

/** A tab's measured position inside the row. */
export interface TabLayout {
  x: number;
  width: number;
}

export interface TabsGeometry {
  /** Tab height. */
  height: number;
  /** Glyph size. */
  icon: number;
  /** Horizontal padding of a tab. */
  paddingX: number;
}

/** Geometry per size. */
export const TABS_GEOMETRY: Record<TabsSize, TabsGeometry> = {
  sm: { height: 40, icon: 16, paddingX: 12 },
  md: { height: 48, icon: 18, paddingX: 16 },
};

/** Thickness of the underline indicator. */
export const TABS_UNDERLINE_HEIGHT = 2;

/** `true` when `value` is a well-formed tab. */
export const isTabItem = (value: unknown): value is TabItem =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as TabItem).label === 'string' &&
  typeof (value as TabItem).value === 'string' &&
  ((value as TabItem).iconName === undefined ||
    typeof (value as TabItem).iconName === 'string') &&
  ((value as TabItem).badgeCount === undefined ||
    typeof (value as TabItem).badgeCount === 'number');

/**
 * The tabs a bar renders. A malformed entry is a data error — it is
 * reported, never silently skipped, so an author sees which item is wrong.
 */
export const readTabItems = (items: unknown): TabItem[] => {
  if (items === undefined || items === null) return [];
  if (!Array.isArray(items)) {
    throw new Error(
      'Tabs: items must be an array of {label, value, iconName?, badgeCount?}',
    );
  }
  items.forEach((item, index) => {
    if (!isTabItem(item)) {
      throw new Error(
        `Tabs: items[${index}] must be {label: string, value: string, iconName?: string, badgeCount?: number}`,
      );
    }
  });
  return items as TabItem[];
};
