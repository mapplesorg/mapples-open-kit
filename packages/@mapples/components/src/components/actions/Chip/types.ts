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

export interface ChipGeometry {
  height: number;
  paddingX: number;
  glyph: number;
  labelVariant: string;
}

/** Geometry per size. */
export const CHIP_GEOMETRY: Record<ChipSize, ChipGeometry> = {
  sm: { height: 28, paddingX: 10, glyph: 14, labelVariant: 'Caption' },
  md: { height: 32, paddingX: 12, glyph: 16, labelVariant: 'Label' },
};
