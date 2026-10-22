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
  /** Small line above the label ("DAY 2" over "Sat 7") — a two-line tab. */
  overline?: string;
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

/** Default thickness of the underline indicator. */
export const TABS_UNDERLINE_HEIGHT = 2;

/** Extra tab height when any tab carries an `overline` (the second line). */
export const TABS_OVERLINE_EXTRA_HEIGHT = 16;

/**
 * The indicator thickness and inset a bar draws with. A negative, zero or
 * non-finite thickness, or a negative or non-finite inset, is an authoring
 * error — it is reported, never clamped.
 */
export const readIndicatorGeometry = (
  thickness: unknown,
  inset: unknown,
): { thickness: number; inset: number } => {
  if (
    typeof thickness !== 'number' ||
    !Number.isFinite(thickness) ||
    thickness <= 0
  ) {
    throw new Error(
      `Tabs: indicatorThickness must be a positive number of points (got ${String(thickness)})`,
    );
  }
  if (typeof inset !== 'number' || !Number.isFinite(inset) || inset < 0) {
    throw new Error(
      `Tabs: indicatorInset must be a number of points ≥ 0 (got ${String(inset)})`,
    );
  }
  return { thickness, inset };
};

/** `true` when `value` is a well-formed tab. */
export const isTabItem = (value: unknown): value is TabItem =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as TabItem).label === 'string' &&
  typeof (value as TabItem).value === 'string' &&
  ((value as TabItem).iconName === undefined ||
    typeof (value as TabItem).iconName === 'string') &&
  ((value as TabItem).badgeCount === undefined ||
    typeof (value as TabItem).badgeCount === 'number') &&
  ((value as TabItem).overline === undefined ||
    typeof (value as TabItem).overline === 'string');

/**
 * The tabs a bar renders. A malformed entry is a data error — it is
 * reported, never silently skipped, so an author sees which item is wrong.
 */
export const readTabItems = (items: unknown): TabItem[] => {
  if (items === undefined || items === null) return [];
  if (!Array.isArray(items)) {
    throw new Error(
      'Tabs: items must be an array of {label, value, iconName?, badgeCount?, overline?}',
    );
  }
  items.forEach((item, index) => {
    if (!isTabItem(item)) {
      throw new Error(
        `Tabs: items[${index}] must be {label: string, value: string, iconName?: string, badgeCount?: number, overline?: string}`,
      );
    }
  });
  return items as TabItem[];
};
