/** Track thicknesses of the ProgressBar. */
export const PROGRESS_BAR_SIZES = ['sm', 'md', 'lg'] as const;
export type ProgressBarSize = (typeof PROGRESS_BAR_SIZES)[number];

/** Track thickness in points per size. */
export const PROGRESS_BAR_TRACK: Record<ProgressBarSize, number> = {
  sm: 4,
  md: 8,
  lg: 12,
};

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
