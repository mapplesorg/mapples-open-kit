/** The axis a `FlipCard` turns around. */
export const FLIP_CARD_AXES = ['horizontal', 'vertical'] as const;

export type FlipCardAxis = (typeof FLIP_CARD_AXES)[number];

/** How long a flip takes by default, in ms. */
export const FLIP_CARD_DURATION = 600;

/** The distance the card is seen from: smaller exaggerates the turn. */
export const FLIP_CARD_PERSPECTIVE = 1000;

/** The curve of the turn: it settles with a slight overshoot. */
export const FLIP_CARD_EASING = 'cubic-bezier(0.3, 1.2, 0.4, 1)';
