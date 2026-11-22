/** Sizes of the button. */
export const REACTION_BUTTON_SIZES = ['sm', 'md', 'lg'] as const;
export type ReactionButtonSize = (typeof REACTION_BUTTON_SIZES)[number];

/** Glyph size per button size. */
export const REACTION_BUTTON_GLYPH: Record<ReactionButtonSize, number> = {
  sm: 20,
  md: 24,
  lg: 32,
};

/** The smallest comfortable touch target. */
export const REACTION_BUTTON_TOUCH_TARGET = 44;
