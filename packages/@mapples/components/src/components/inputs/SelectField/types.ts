/** Field surfaces of the select. */
export const SELECT_FIELD_VARIANTS = ['outlined', 'filled'] as const;
export type SelectFieldVariant = (typeof SELECT_FIELD_VARIANTS)[number];

/** Option list geometry. */
export const SELECT_FIELD_MENU = {
  /** Height of one option row. */
  optionHeight: 40,
  /** Rows shown before the list scrolls. */
  maxVisible: 6,
  /** Height of the scrolling list. */
  maxHeight: 240,
} as const;
