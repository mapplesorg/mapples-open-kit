/** Sizes of the box. */
export const CHECKBOX_SIZES = ['sm', 'md', 'lg'] as const;
export type CheckboxSize = (typeof CHECKBOX_SIZES)[number];

/** Where the label sits relative to the box. */
export const CHECKBOX_LABEL_POSITIONS = ['right', 'left'] as const;
export type CheckboxLabelPosition = (typeof CHECKBOX_LABEL_POSITIONS)[number];

/** Box edge per size. */
export const CHECKBOX_BOX: Record<CheckboxSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};
