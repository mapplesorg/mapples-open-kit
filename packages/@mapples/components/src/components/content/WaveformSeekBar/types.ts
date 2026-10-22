/** WaveformSeekBar geometry. */
export const WAVEFORM_SEEK_BAR_GEOMETRY = {
  /** Default height of the bar area. */
  height: 48,
  /** Default width of one amplitude bar. */
  barWidth: 3,
  /** Default minimum space between bars. */
  barGap: 2,
  /** Shortest bar drawn for a silent sample, so the timeline stays visible. */
  minBarHeight: 2,
  /** Width of the playhead line. */
  playhead: 2,
} as const;

/** Default step of the screen-reader increment/decrement actions, in seconds. */
export const WAVEFORM_SEEK_BAR_ACCESSIBILITY_STEP = 15;

/**
 * Formats seconds as `m:ss`, or `h:mm:ss` when `withHours` is set (the
 * duration reaches an hour, so both labels keep the same shape).
 */
export const formatPlaybackTime = (
  seconds: number,
  withHours: boolean,
): string => {
  const whole = Math.max(0, Math.floor(seconds));
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  const ss = String(s).padStart(2, '0');
  return withHours
    ? `${h}:${String(m).padStart(2, '0')}:${ss}`
    : `${Math.floor(whole / 60)}:${ss}`;
};
