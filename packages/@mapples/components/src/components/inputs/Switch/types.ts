/** Sizes of the Switch track. */
export const SWITCH_SIZES = ['sm', 'md'] as const;
export type SwitchSize = (typeof SWITCH_SIZES)[number];

/** Where the label sits relative to the track. */
export const SWITCH_LABEL_POSITIONS = ['left', 'right'] as const;
export type SwitchLabelPosition = (typeof SWITCH_LABEL_POSITIONS)[number];

/** Track and thumb corners: full circle, or a rounded square from the project shape. */
export const SWITCH_SHAPES = ['round', 'rounded'] as const;
export type SwitchShape = (typeof SWITCH_SHAPES)[number];

/** The thumb's default drop shadow. */
export const SWITCH_THUMB_SHADOW = '0px 1px 3px rgba(0, 0, 0, 0.25)';

export interface SwitchGeometry {
  width: number;
  height: number;
  thumb: number;
  padding: number;
}

/** Track and thumb geometry per size. */
export const SWITCH_GEOMETRY: Record<SwitchSize, SwitchGeometry> = {
  sm: { width: 40, height: 24, thumb: 18, padding: 3 },
  md: { width: 52, height: 32, thumb: 26, padding: 3 },
};
