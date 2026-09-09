/** Spinner sizes. */
export const SPINNER_SIZES = ['sm', 'md', 'lg'] as const;
export type SpinnerSize = (typeof SPINNER_SIZES)[number];

/** Spinner colour roles: the primary colour, secondary text, or the colour on a primary fill. */
export const SPINNER_TONES = ['primary', 'neutral', 'onPrimary'] as const;
export type SpinnerTone = (typeof SPINNER_TONES)[number];

export interface SpinnerGeometry {
  /** The `ActivityIndicator` size. */
  indicator: 'small' | 'large';
  /** Edge of the box the indicator is centred in. */
  box: number;
}

/** Geometry per size. */
export const SPINNER_GEOMETRY: Record<SpinnerSize, SpinnerGeometry> = {
  sm: { indicator: 'small', box: 20 },
  md: { indicator: 'small', box: 24 },
  lg: { indicator: 'large', box: 36 },
};
