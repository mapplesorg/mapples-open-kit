/** ProgressCircle shapes. */
export const PROGRESS_CIRCLE_VARIANTS = ['ring', 'gauge'] as const;
export type ProgressCircleVariant = (typeof PROGRESS_CIRCLE_VARIANTS)[number];

/** Degrees of the circle a gauge arc covers; the gap opens at the bottom. */
export const GAUGE_SWEEP = 240;

/** Fraction of the circumference the indeterminate arc covers. */
export const PROGRESS_CIRCLE_INDETERMINATE_ARC = 0.25;

/** Geometry derived from the edge and stroke of a circle. */
export interface CircleGeometry {
  /** Radius of the stroke's centre line. */
  radius: number;
  /** Length of the full circle. */
  circumference: number;
  /** Length of the visible arc (the whole circle for a ring). */
  arc: number;
  /** Degrees the SVG turns so the arc starts at 12 o'clock (ring) or at the gap's end (gauge). */
  rotation: number;
}

/** The stroke geometry of a ring or gauge of `size` points. */
export const circleGeometry = (
  size: number,
  strokeWidth: number,
  variant: ProgressCircleVariant,
): CircleGeometry => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gauge = variant === 'gauge';
  return {
    radius,
    circumference,
    arc: gauge ? (circumference * GAUGE_SWEEP) / 360 : circumference,
    // SVG angles start at 3 o'clock and run clockwise.
    rotation: gauge ? 90 + (360 - GAUGE_SWEEP) / 2 : -90,
  };
};
