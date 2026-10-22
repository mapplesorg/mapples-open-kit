/**
 * Field surfaces: an outlined box, a tinted fill, a bottom rule only
 * (`underlined`, thickening in the tone colour on focus) or no surface at all
 * (`plain`, for a field inside a card).
 */
export const INPUT_FIELD_VARIANTS = [
  'outlined',
  'filled',
  'underlined',
  'plain',
] as const;
export type InputFieldVariant = (typeof INPUT_FIELD_VARIANTS)[number];

/** Bottom rule of the `underlined` variant at rest and while focused (pt). */
export const INPUT_FIELD_RULE = { rest: 1, focused: 2 } as const;
