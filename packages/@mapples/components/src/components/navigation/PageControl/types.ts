/** Dot sizes. */
export const PAGE_CONTROL_SIZES = ['sm', 'md'] as const;
export type PageControlSize = (typeof PAGE_CONTROL_SIZES)[number];

/** Indicator styles. */
export const PAGE_CONTROL_VARIANTS = ['dots', 'bars', 'numeric'] as const;
export type PageControlVariant = (typeof PAGE_CONTROL_VARIANTS)[number];

export interface PageControlGeometry {
  /** Dot diameter (and bar height). */
  dot: number;
  /** Width of the active bar. */
  bar: number;
  /** Space between indicators. */
  gap: number;
}

/** Geometry per size. */
export const PAGE_CONTROL_GEOMETRY: Record<
  PageControlSize,
  PageControlGeometry
> = {
  sm: { dot: 6, bar: 24, gap: 6 },
  md: { dot: 8, bar: 24, gap: 8 },
};
