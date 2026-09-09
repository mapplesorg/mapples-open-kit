/** Colour roles of a text link. */
export const TEXT_LINK_TONES = ['primary', 'accent', 'neutral'] as const;
export type TextLinkTone = (typeof TEXT_LINK_TONES)[number];

/** Trailing glyph size in points. */
export const TEXT_LINK_ICON_SIZE = 16;

/** Opacity of the link while pressed. */
export const TEXT_LINK_PRESSED_OPACITY = 0.7;
