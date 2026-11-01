/** Chip roles, after Material's chip kinds. */
export const CHIP_VARIANTS = [
  'assist',
  'filter',
  'input',
  'suggestion',
] as const;
export type ChipVariant = (typeof CHIP_VARIANTS)[number];

/** Chip heights. */
export const CHIP_SIZES = ['sm', 'md'] as const;
export type ChipSize = (typeof CHIP_SIZES)[number];

/**
 * How a selected chip paints: `tonal` a soft tone container with tone ink
 * text, `filled` the tone's main colour with contrast text.
 */
export const CHIP_SELECTED_APPEARANCES = ['tonal', 'filled'] as const;
export type ChipSelectedAppearance = (typeof CHIP_SELECTED_APPEARANCES)[number];

/**
 * The chip's form: `pill` a content-sized outlined pill, `tile` the icon in
 * a large circle above the label (category rails).
 */
export const CHIP_PRESENTATIONS = ['pill', 'tile'] as const;
export type ChipPresentation = (typeof CHIP_PRESENTATIONS)[number];

export interface ChipGeometry {
  height: number;
  paddingX: number;
  glyph: number;
  labelVariant: string;
  /** Circle diameter of the `tile` presentation. */
  tile: number;
  /** Glyph size inside the `tile` circle. */
  tileGlyph: number;
}

/** Geometry per size. */
export const CHIP_GEOMETRY: Record<ChipSize, ChipGeometry> = {
  sm: {
    height: 28,
    paddingX: 10,
    glyph: 14,
    labelVariant: 'Caption',
    tile: 56,
    tileGlyph: 24,
  },
  md: {
    height: 32,
    paddingX: 12,
    glyph: 16,
    labelVariant: 'Label',
    tile: 64,
    tileGlyph: 28,
  },
};
