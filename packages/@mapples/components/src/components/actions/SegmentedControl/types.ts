/**
 * Segmented control looks: `pill` a soft track with an indicator that slides
 * under the active segment; `outlined` a bordered box with hairline dividers
 * and the active segment filled solid in the tone.
 */
export const SEGMENTED_CONTROL_VARIANTS = ['pill', 'outlined'] as const;
export type SegmentedControlVariant =
  (typeof SEGMENTED_CONTROL_VARIANTS)[number];

/** Segmented control heights. */
export const SEGMENTED_CONTROL_SIZES = ['sm', 'md'] as const;
export type SegmentedControlSize = (typeof SEGMENTED_CONTROL_SIZES)[number];

export interface SegmentedControlGeometry {
  /** Height of the whole control. */
  height: number;
  /** Glyph size (with `showIcons`). */
  icon: number;
  /** Horizontal padding of a segment. */
  paddingX: number;
}

/** Geometry per size. */
export const SEGMENTED_CONTROL_GEOMETRY: Record<
  SegmentedControlSize,
  SegmentedControlGeometry
> = {
  sm: { height: 36, icon: 16, paddingX: 12 },
  md: { height: 44, icon: 18, paddingX: 16 },
};

/** Inset of the segments and the indicator inside the track. */
export const SEGMENTED_CONTROL_INSET = 3;

/** How many segments a control accepts. */
export const SEGMENTED_CONTROL_OPTION_COUNT = { min: 2, max: 5 } as const;
