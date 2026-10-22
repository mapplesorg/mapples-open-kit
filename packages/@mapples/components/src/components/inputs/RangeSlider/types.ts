/** The selected range of a {@link RangeSlider}: `[low, high]`. */
export type RangeSliderValue = [number, number];

/** Which thumb a gesture or an accessibility action moves. */
export type RangeSliderThumb = 0 | 1;

/** Defaults shared by the component and its canvas schematic. */
export const RANGE_SLIDER_DEFAULTS: {
  /** Height of the histogram above the track. */
  histogramHeight: number;
  /** Screen-reader names of the low and high thumbs. */
  thumbLabels: [string, string];
} = {
  histogramHeight: 48,
  thumbLabels: ['Minimum', 'Maximum'],
};

/** Space between two histogram bars. */
export const RANGE_SLIDER_BAR_GAP = 2;

/** Decimal places a value snapped to `step` keeps. */
export const rangeDecimalsOf = (step: number): number => {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
};

/** Validates the bounds, `step` and `minDistance` of a range slider. */
export const checkRangeBounds = (
  min: number,
  max: number,
  step: number,
  minDistance: number,
): void => {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new Error(
      `RangeSlider: max (${max}) must be a finite number greater than min (${min})`,
    );
  }
  if (!(step > 0)) {
    throw new Error(`RangeSlider: step (${step}) must be positive`);
  }
  if (!(minDistance >= 0) || minDistance > max - min) {
    throw new Error(
      `RangeSlider: minDistance (${minDistance}) must be between 0 and max - min (${max - min})`,
    );
  }
};

/**
 * A `[low, high]` value checked against the bounds: two finite numbers
 * inside `min`…`max`, `low` not above `high` and at least `minDistance`
 * apart. A malformed value is reported, never clamped.
 */
export const readRangeValue = (
  value: unknown,
  name: string,
  min: number,
  max: number,
  minDistance: number,
): RangeSliderValue => {
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    !value.every((part) => typeof part === 'number' && Number.isFinite(part))
  ) {
    throw new Error(
      `RangeSlider: ${name} must be [low, high], two finite numbers`,
    );
  }
  const [low, high] = value as RangeSliderValue;
  if (low < min || high > max) {
    throw new Error(
      `RangeSlider: ${name} [${low}, ${high}] must lie inside min…max [${min}, ${max}]`,
    );
  }
  if (high - low < minDistance) {
    throw new Error(
      `RangeSlider: ${name} [${low}, ${high}] must have low ≤ high, at least minDistance (${minDistance}) apart`,
    );
  }
  return [low, high];
};

/** Histogram bar heights checked: a non-empty array of finite numbers ≥ 0. */
export const readRangeHistogram = (histogram: unknown): number[] => {
  if (!Array.isArray(histogram) || histogram.length === 0) {
    throw new Error(
      'RangeSlider: histogram must be a non-empty array of numbers',
    );
  }
  histogram.forEach((count, index) => {
    if (typeof count !== 'number' || !Number.isFinite(count) || count < 0) {
      throw new Error(
        `RangeSlider: histogram[${index}] (${String(count)}) must be a finite number of at least 0`,
      );
    }
  });
  return histogram as number[];
};

/**
 * Whether histogram bar `index` of `count` lies in the selected range: the
 * value at the bar's centre is between `low` and `high`.
 */
export const histogramBarInRange = (
  index: number,
  count: number,
  [low, high]: RangeSliderValue,
  min: number,
  max: number,
): boolean => {
  const centre = min + ((index + 0.5) / count) * (max - min);
  return centre >= low && centre <= high;
};

/**
 * The thumb a touch at `value` grabs: the nearer one. When both sit on the
 * same spot, the one that can still move toward the touch.
 */
export const nearestRangeThumb = (
  value: number,
  [low, high]: RangeSliderValue,
): RangeSliderThumb => {
  if (low === high) return value < low ? 0 : 1;
  return Math.abs(value - low) <= Math.abs(value - high) ? 0 : 1;
};
