/** Cell sizes of the pin input. */
export const PIN_INPUT_SIZES = ['sm', 'md', 'lg'] as const;
export type PinInputSize = (typeof PIN_INPUT_SIZES)[number];

export interface PinInputGeometry {
  /** Cell edge in points. */
  cell: number;
  /** Digit font size. */
  digit: number;
  /** Gap between cells. */
  gap: number;
}

/** Cell geometry per size. */
export const PIN_INPUT_GEOMETRY: Record<PinInputSize, PinInputGeometry> = {
  sm: { cell: 40, digit: 18, gap: 8 },
  md: { cell: 48, digit: 22, gap: 10 },
  lg: { cell: 56, digit: 26, gap: 12 },
};

/** `boxes`: a bordered cell per character; `dots`: a dot per character that fills in (passcodes). */
export const PIN_INPUT_VARIANTS = ['boxes', 'dots'] as const;
export type PinInputVariant = (typeof PIN_INPUT_VARIANTS)[number];

export interface PinInputDotGeometry {
  /** Dot diameter in points. */
  dot: number;
  /** Gap between dots. */
  gap: number;
}

/** Dot geometry per size (`dots` variant). */
export const PIN_INPUT_DOT_GEOMETRY: Record<PinInputSize, PinInputDotGeometry> =
  {
    sm: { dot: 12, gap: 16 },
    md: { dot: 14, gap: 20 },
    lg: { dot: 16, gap: 24 },
  };
