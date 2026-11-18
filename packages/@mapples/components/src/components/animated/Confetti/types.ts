/** How many pieces a `Confetti` drops by default. */
export const CONFETTI_COUNT = 24;

/** How long the slowest piece takes to fall, in ms. */
export const CONFETTI_DURATION = 2600;

/** The most pieces a `Confetti` draws: each is an animated view. */
export const CONFETTI_MAX_COUNT = 80;

/** One piece of confetti: where it starts, what it looks like, when it falls. */
export interface ConfettiPiece {
  /** Horizontal start, a fraction of the width from 0 to 1. */
  x: number;
  width: number;
  height: number;
  color: string;
  /** Milliseconds before it starts. */
  delay: number;
  /** Milliseconds it takes to fall. */
  duration: number;
  /** Degrees it turns on the way down. */
  spin: number;
}

/**
 * A number from 0 to 1 that depends only on the piece's index and the
 * channel asked for: the same burst looks the same on every run and on
 * every device, so a design can be reviewed.
 */
const scatter = (index: number, channel: number): number =>
  (Math.sin((index + 1) * (51.3 + channel * 17.7)) + 1) / 2;

/**
 * The pieces of a burst: spread across the width, each with its own size,
 * colour (the palette in order), delay and length.
 *
 * @param count - How many pieces
 * @param colors - The palette, used in order
 * @param duration - How long the slowest piece falls, in ms
 */
export const confettiPieces = (
  count: number,
  colors: readonly string[],
  duration: number,
): ConfettiPiece[] =>
  Array.from({ length: count }, (_, index) => {
    const size = 6 + Math.round(scatter(index, 1) * 6);
    return {
      x: scatter(index, 0),
      width: size,
      height: Math.round(size * 1.5),
      color: colors[index % colors.length],
      delay: Math.round(scatter(index, 2) * duration * 0.45),
      duration: Math.round(duration * (0.6 + scatter(index, 3) * 0.4)),
      spin: 360 + Math.round(scatter(index, 4) * 360),
    };
  });
