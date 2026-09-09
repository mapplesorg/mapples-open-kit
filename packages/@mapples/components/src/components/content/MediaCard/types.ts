import { CARD_VARIANTS, CardVariant } from '../Card/types';

/** Photo placements. */
export const MEDIA_CARD_ORIENTATIONS = ['vertical', 'horizontal'] as const;
export type MediaCardOrientation = (typeof MEDIA_CARD_ORIENTATIONS)[number];

/** Surface treatments (the same set as `Card`). */
export const MEDIA_CARD_VARIANTS = CARD_VARIANTS;
export type MediaCardVariant = CardVariant;

/** Photo edge of the horizontal layout. */
export const MEDIA_CARD_THUMBNAIL = 96;

/** Default photo aspect ratio of the vertical layout (16:9). */
export const MEDIA_CARD_ASPECT_RATIO = 1.777;
