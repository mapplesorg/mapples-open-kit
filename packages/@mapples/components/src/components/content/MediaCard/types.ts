import { CARD_VARIANTS } from '../Card/types';

/** Photo placements. */
export const MEDIA_CARD_ORIENTATIONS = ['vertical', 'horizontal'] as const;
export type MediaCardOrientation = (typeof MEDIA_CARD_ORIENTATIONS)[number];

/**
 * Surface treatments: `Card`'s set plus `plain` (no surface — the photo keeps
 * its corners and the text sits right under it).
 */
export const MEDIA_CARD_VARIANTS = [...CARD_VARIANTS, 'plain'] as const;
export type MediaCardVariant = (typeof MEDIA_CARD_VARIANTS)[number];

/** Photo side of the horizontal layout. */
export const MEDIA_CARD_IMAGE_POSITIONS = ['start', 'end'] as const;
export type MediaCardImagePosition =
  (typeof MEDIA_CARD_IMAGE_POSITIONS)[number];

/** Photo edge of the horizontal layout. */
export const MEDIA_CARD_THUMBNAIL = 96;

/** Default photo aspect ratio of the vertical layout (16:9). */
export const MEDIA_CARD_ASPECT_RATIO = 1.777;

/** Default number of title lines. */
export const MEDIA_CARD_TITLE_LINES = 2;

/** Glyph size of the title-row accessory. */
export const MEDIA_CARD_ACCESSORY_ICON = 14;
