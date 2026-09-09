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
