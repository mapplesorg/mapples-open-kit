import { RADII } from '@mapples/ui';

/** Fab sizes — the edge of the square button. */
export const FAB_SIZES = ['sm', 'md', 'lg'] as const;
export type FabSize = (typeof FAB_SIZES)[number];

/** Fab colour roles: a tone fill, or the surface colour. */
export const FAB_TONES = ['primary', 'accent', 'surface'] as const;
export type FabTone = (typeof FAB_TONES)[number];

export interface FabGeometry {
  /** Edge of the square button. */
  edge: number;
  /** Glyph size. */
  icon: number;
  /** Corner radius. */
  radius: number;
}

/** Geometry per size of a square Fab. */
export const FAB_GEOMETRY: Record<FabSize, FabGeometry> = {
  sm: { edge: 40, icon: 20, radius: RADII.lg },
  md: { edge: 56, icon: 24, radius: RADII.lg },
  lg: { edge: 96, icon: 36, radius: 28 },
};

/** Geometry of an extended Fab (one with a label), whatever its `size`. */
export const FAB_EXTENDED = {
  height: 56,
  paddingX: 20,
  icon: 24,
  radius: RADII.lg,
  gap: 12,
} as const;

/** The smallest comfortable touch target; smaller Fabs pad their hit area up to it. */
export const FAB_TOUCH_TARGET = 44;
