/** Sizes of the Switch track. */
export const SWITCH_SIZES = ['sm', 'md'] as const;
export type SwitchSize = (typeof SWITCH_SIZES)[number];

/** Where the label sits relative to the track. */
export const SWITCH_LABEL_POSITIONS = ['left', 'right'] as const;
export type SwitchLabelPosition = (typeof SWITCH_LABEL_POSITIONS)[number];

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
