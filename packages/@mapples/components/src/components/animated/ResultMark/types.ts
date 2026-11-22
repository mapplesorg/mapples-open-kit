import { Tone } from '@mapples/ui';

/** What the mark says. */
export const RESULT_MARK_STATUSES = [
  'success',
  'error',
  'warning',
  'info',
] as const;
export type ResultMarkStatus = (typeof RESULT_MARK_STATUSES)[number];

/** The mark is drawn in a box of this edge (SVG units). */
export const RESULT_MARK_BOX = 48;

/** Radius of the ring. */
export const RESULT_MARK_RADIUS = 21;

/** Length of the ring. */
export const RESULT_MARK_RING_LENGTH = 2 * Math.PI * RESULT_MARK_RADIUS;

/**
 * The ring as a path that starts at the top and runs clockwise, like a
 * clock hand, so it closes from 12 o'clock without a rotation.
 */
export const RESULT_MARK_RING_PATH = `M${RESULT_MARK_BOX / 2} ${
  RESULT_MARK_BOX / 2 - RESULT_MARK_RADIUS
}a${RESULT_MARK_RADIUS} ${RESULT_MARK_RADIUS} 0 1 1 -0.01 0`;

/** How long the mark takes to draw, in ms. */
export const RESULT_MARK_DURATION = 700;

export interface ResultMarkGlyph {
  /** The strokes of the glyph; they are drawn at the same time. */
  paths: string[];
  /** Length of the longest stroke: the dash that hides and reveals them. */
  length: number;
  /** The colour role the status is painted in. */
  tone: Tone;
}

/** The glyph inside the ring, per status. */
export const RESULT_MARK_GLYPHS: Record<ResultMarkStatus, ResultMarkGlyph> = {
  // A tick: down to the corner, up to the end.
  success: {
    paths: ['M14 24.5L21 31.5L34 17.5'],
    length: 29.1,
    tone: 'success',
  },
  // A cross: two strokes of the same length.
  error: {
    paths: ['M17 17L31 31', 'M31 17L17 31'],
    length: 19.8,
    tone: 'error',
  },
  // An exclamation mark: the bar, then the dot (a stroke too short to see grow).
  warning: {
    paths: ['M24 13L24 27', 'M24 33.5L24 34'],
    length: 14,
    tone: 'warning',
  },
  // An "i": the dot, then the bar.
  info: { paths: ['M24 14L24 14.5', 'M24 21L24 35'], length: 14, tone: 'info' },
};

/** The spoken name of each status. */
export const RESULT_MARK_LABELS: Record<ResultMarkStatus, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information',
};
