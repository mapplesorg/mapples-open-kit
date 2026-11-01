/** Sizes of the box; `xl` is a 44 pt habit-row box. */
export const CHECKBOX_SIZES = ['sm', 'md', 'lg', 'xl'] as const;
export type CheckboxSize = (typeof CHECKBOX_SIZES)[number];

/** Where the label sits relative to the box. */
export const CHECKBOX_LABEL_POSITIONS = ['right', 'left'] as const;
export type CheckboxLabelPosition = (typeof CHECKBOX_LABEL_POSITIONS)[number];

/** Box edge per size. */
export const CHECKBOX_BOX: Record<CheckboxSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 44,
};

/** Check glyph size per size — 4 pt inside the box up to `lg`, then scaled from the box. */
export const CHECKBOX_GLYPH: Record<CheckboxSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};
