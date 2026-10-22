/** Track thicknesses of the ProgressBar. */
export const PROGRESS_BAR_SIZES = ['xs', 'sm', 'md', 'lg'] as const;
export type ProgressBarSize = (typeof PROGRESS_BAR_SIZES)[number];

/** Track thickness in points per size (`xs` is a mini-player hairline). */
export const PROGRESS_BAR_TRACK: Record<ProgressBarSize, number> = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
};

/** Gap between the bars of a segmented track, in points. */
export const PROGRESS_BAR_SEGMENT_GAP = 4;

/** Width of the `markerValue` tick, in points. */
export const PROGRESS_BAR_MARKER_WIDTH = 2;

/** How far the marker tick reaches past each side of the track, in points. */
export const PROGRESS_BAR_MARKER_OVERHANG = 4;

/** Fraction of the track the indeterminate fill covers. */
export const PROGRESS_BAR_INDETERMINATE_WIDTH = 0.4;

/**
 * `value` as a 0–1 fraction of `max`, clamped. A non-positive `max` or a
 * non-numeric `value` is a data error and is reported, never hidden.
 */
export const progressFraction = (
  value: number,
  max: number,
  component: string,
): number => {
  if (typeof max !== 'number' || !(max > 0)) {
    throw new Error(`${component}: max (${String(max)}) must be positive`);
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(
      `${component}: value (${String(value)}) must be a finite number`,
    );
  }
  return Math.min(1, Math.max(0, value / max));
};

/**
 * The number of bars of a segmented track. Anything but a positive whole
 * number is a data error and is reported, never rounded away.
 */
export const readSegmentCount = (
  segments: unknown,
  component: string,
): number => {
  if (
    typeof segments !== 'number' ||
    !Number.isInteger(segments) ||
    segments < 1
  ) {
    throw new Error(
      `${component}: segments (${String(segments)}) must be a positive whole number`,
    );
  }
  return segments;
};
