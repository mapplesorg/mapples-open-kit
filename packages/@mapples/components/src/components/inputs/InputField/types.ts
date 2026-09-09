/** Field surfaces. */
export const INPUT_FIELD_VARIANTS = ['outlined', 'filled'] as const;
export type InputFieldVariant = (typeof INPUT_FIELD_VARIANTS)[number];
