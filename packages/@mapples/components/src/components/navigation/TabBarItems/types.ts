/** When tab labels show. */
export const TAB_BAR_ITEMS_LABEL_VISIBILITIES = [
  'always',
  'selected',
  'never',
] as const;
export type TabBarItemsLabelVisibility =
  (typeof TAB_BAR_ITEMS_LABEL_VISIBILITIES)[number];

/** The mark behind the active tab's icon. */
export const TAB_BAR_ITEMS_INDICATORS = ['pill', 'none'] as const;
export type TabBarItemsIndicator = (typeof TAB_BAR_ITEMS_INDICATORS)[number];

/** Default glyph size. */
export const TAB_BAR_ITEMS_ICON_SIZE = 24;

/** Height of the row before the safe-area padding — the platform tab bar's. */
export const TAB_BAR_ITEMS_MIN_HEIGHT = 49;
