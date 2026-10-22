/** Surface treatments of the mini player. */
export const MINI_PLAYER_VARIANTS = ['surface', 'tonal'] as const;
export type MiniPlayerVariant = (typeof MINI_PLAYER_VARIANTS)[number];

/** MiniPlayer geometry. */
export const MINI_PLAYER_GEOMETRY = {
  /** Edge of the square artwork. */
  artwork: 44,
  /** Thickness of the progress line on the bottom edge. */
  progress: 2,
  /** Glyph size of the play/pause and skip buttons. */
  glyph: 26,
  /** Font size of the number inside the skip arrow. */
  skipLabel: 9,
} as const;
