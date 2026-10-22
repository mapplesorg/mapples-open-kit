/** How a {@link CountdownTimer} lays out its digits. */
export const COUNTDOWN_TIMER_FORMATS = ['auto', 'mm:ss', 'hh:mm:ss'] as const;
export type CountdownTimerFormat = (typeof COUNTDOWN_TIMER_FORMATS)[number];

/** CountdownTimer shapes: bare digits, or digits inside a draining ring. */
export const COUNTDOWN_TIMER_VARIANTS = ['text', 'ring'] as const;
export type CountdownTimerVariant = (typeof COUNTDOWN_TIMER_VARIANTS)[number];

/** Defaults shared by the component and its canvas schematic. */
export const COUNTDOWN_TIMER_DEFAULTS = {
  /** Digit font size of the `text` variant. */
  textSize: 40,
  /** Ring edge of the `ring` variant. */
  ringSize: 120,
  /** Spoken once when the countdown reaches zero. */
  endMessage: 'Time is up',
} as const;

/** The moment the countdown ends, read from exactly one of its two sources. */
export interface CountdownTimerSource {
  /** Length in milliseconds, when counting a duration. */
  durationMs?: number;
  /** Epoch milliseconds of the end, when counting to a timestamp. */
  endsAtMs?: number;
}

/**
 * Validates `durationSeconds` / `endsAt`: exactly one must be given, the
 * duration finite and not negative, the timestamp a parseable ISO string.
 */
export const readCountdownSource = (
  durationSeconds: unknown,
  endsAt: unknown,
): CountdownTimerSource => {
  const hasDuration = durationSeconds !== undefined && durationSeconds !== null;
  const hasEnd = endsAt !== undefined && endsAt !== null && endsAt !== '';
  if (hasDuration === hasEnd) {
    throw new Error(
      'CountdownTimer: give exactly one of durationSeconds or endsAt',
    );
  }
  if (hasDuration) {
    if (
      typeof durationSeconds !== 'number' ||
      !Number.isFinite(durationSeconds) ||
      durationSeconds < 0
    ) {
      throw new Error(
        `CountdownTimer: durationSeconds (${String(durationSeconds)}) must be a finite number of at least 0`,
      );
    }
    return { durationMs: Math.round(durationSeconds * 1000) };
  }
  const endsAtMs = typeof endsAt === 'string' ? Date.parse(endsAt) : NaN;
  if (!Number.isFinite(endsAtMs)) {
    throw new Error(
      `CountdownTimer: endsAt (${String(endsAt)}) must be an ISO timestamp such as '2026-10-22T18:30:00Z'`,
    );
  }
  return { endsAtMs };
};

/** Milliseconds left of a source at `now`, never below zero. */
export const countdownRemaining = (
  source: CountdownTimerSource,
  now: number,
): number =>
  source.endsAtMs !== undefined
    ? Math.max(0, source.endsAtMs - now)
    : (source.durationMs ?? 0);

/** Whole seconds a countdown shows: a partial second counts as a full one. */
export const countdownSeconds = (remainingMs: number): number =>
  Math.ceil(remainingMs / 1000);

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * The digits of `seconds`: `auto` is `mm:ss` under an hour and `h:mm:ss`
 * from an hour up; `mm:ss` keeps counting minutes past 59 (`84:05`);
 * `hh:mm:ss` always shows two-digit hours.
 */
export const formatCountdown = (
  seconds: number,
  format: CountdownTimerFormat,
): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (format === 'mm:ss') {
    return `${pad(Math.floor(seconds / 60))}:${pad(secs)}`;
  }
  if (format === 'hh:mm:ss') {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${pad(minutes)}:${pad(secs)}`;
};

const unit = (count: number, name: string) =>
  `${count} ${name}${count === 1 ? '' : 's'}`;

/** The screen-reader reading of `seconds`: "1 minute 24 seconds left". */
export const spokenCountdown = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [
    hours > 0 ? unit(hours, 'hour') : '',
    minutes > 0 ? unit(minutes, 'minute') : '',
    secs > 0 || seconds === 0 ? unit(secs, 'second') : '',
  ].filter(Boolean);
  return `${parts.join(' ')} left`;
};
