/** Separator glyph between crumbs. */
export const BREADCRUMB_SEPARATORS = ['chevron', 'slash'] as const;
export type BreadcrumbSeparator = (typeof BREADCRUMB_SEPARATORS)[number];

/** One crumb of the trail. */
export interface BreadcrumbItem {
  /** Visible text. */
  label: string;
  /** The value reported by `onItemPress`. */
  value: string;
}

/** Separator and ellipsis glyph size in points. */
export const BREADCRUMB_GLYPH_SIZE = 16;

/** `true` when `value` is a well-formed crumb. */
export const isBreadcrumbItem = (value: unknown): value is BreadcrumbItem =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as BreadcrumbItem).label === 'string' &&
  typeof (value as BreadcrumbItem).value === 'string';

/**
 * The crumbs a trail renders. A malformed entry is a data error — it is
 * reported, never silently skipped, so an author sees which item is wrong.
 */
export const readBreadcrumbItems = (items: unknown): BreadcrumbItem[] => {
  if (items === undefined || items === null) return [];
  if (!Array.isArray(items)) {
    throw new Error('Breadcrumbs: items must be an array of {label, value}');
  }
  items.forEach((item, index) => {
    if (!isBreadcrumbItem(item)) {
      throw new Error(
        `Breadcrumbs: items[${index}] must be {label: string, value: string}`,
      );
    }
  });
  return items as BreadcrumbItem[];
};
