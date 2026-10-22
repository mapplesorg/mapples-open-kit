/** Overall sizes of the transport row. */
export const PLAYBACK_CONTROLS_SIZES = ['md', 'lg'] as const;
export type PlaybackControlsSize = (typeof PLAYBACK_CONTROLS_SIZES)[number];

/** The buttons of a transport row whose glyph can be renamed. */
export const PLAYBACK_CONTROLS_GLYPHS = [
  'play',
  'pause',
  'skipBack',
  'skipForward',
  'restart',
  'previous',
  'next',
] as const;
export type PlaybackControlsGlyph = (typeof PLAYBACK_CONTROLS_GLYPHS)[number];

/** Project-family glyph names per transport button. */
export type PlaybackControlsIconNames = Partial<
  Record<PlaybackControlsGlyph, string>
>;

/**
 * Default glyphs, named in Ionicons (the default project icon family). The
 * skip-back and restart defaults are clockwise arrows drawn mirrored; a
 * glyph named through `iconNames` is drawn as is.
 */
export const PLAYBACK_CONTROLS_ICON_NAMES: Record<
  PlaybackControlsGlyph,
  string
> = {
  play: 'play',
  pause: 'pause',
  skipBack: 'refresh',
  skipForward: 'refresh',
  restart: 'reload',
  previous: 'play-skip-back',
  next: 'play-skip-forward',
};

/** Default glyphs that are clockwise and must be mirrored to read backwards. */
export const PLAYBACK_CONTROLS_MIRRORED_DEFAULTS: ReadonlySet<PlaybackControlsGlyph> =
  new Set<PlaybackControlsGlyph>(['skipBack', 'restart']);

/** Default skip-back step, in seconds. */
export const PLAYBACK_CONTROLS_SKIP_BACK_SECONDS = 15;

/** Default skip-forward step, in seconds. */
export const PLAYBACK_CONTROLS_SKIP_FORWARD_SECONDS = 30;

/** Geometry per size. */
export const PLAYBACK_CONTROLS_GEOMETRY: Record<
  PlaybackControlsSize,
  {
    /** Diameter of the play/pause button. */
    play: number;
    /** Glyph size of the play/pause button. */
    playGlyph: number;
    /** `IconButton` size of the secondary buttons. */
    button: 'md' | 'lg';
    /** Glyph size of the secondary buttons. */
    glyph: number;
    /** Font size of the number inside the skip glyphs. */
    label: number;
    /** Space between buttons. */
    gap: number;
  }
> = {
  md: {
    play: 64,
    playGlyph: 30,
    button: 'md',
    glyph: 30,
    label: 10,
    gap: 16,
  },
  lg: {
    play: 80,
    playGlyph: 38,
    button: 'lg',
    glyph: 36,
    label: 12,
    gap: 24,
  },
};
