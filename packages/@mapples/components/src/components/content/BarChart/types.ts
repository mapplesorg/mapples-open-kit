/** One bar of a {@link BarChart}. */
export interface BarChartDatum {
  /** Category under the bar ('Mon'). */
  label?: string;
  /** Bar value; finite and not negative. */
  value: number;
  /** Paints the bar in `highlightTone` (today, the selected bucket). */
  highlight?: boolean;
  /** Text above the bar with `showValues`, in place of the number ('48 min'). */
  valueLabel?: string;
}

/** Height reserved above the plot for the value labels with `showValues`. */
export const BAR_CHART_VALUE_SPACE = 20;

/** Thickness of the baseline and the guide lines. */
export const BAR_CHART_LINE = 1;

/**
 * The bars a chart renders. No data — absent, or an empty array, as a bound
 * request leaves it until it answers — draws an empty plot. A malformed
 * entry is a data error — it is reported, never silently skipped, so an
 * author sees which bar is wrong. An optional field a backend sends as
 * `null` counts as absent.
 */
export const readBarChartData = (
  data: unknown,
  component: string,
): BarChartDatum[] => {
  if (data === undefined || data === null) return [];
  if (!Array.isArray(data)) {
    throw new Error(
      `${component}: data must be an array of {label?, value, highlight?, valueLabel?}`,
    );
  }
  return data.map((datum, index) => {
    if (typeof datum !== 'object' || datum === null) {
      throw new Error(
        `${component}: data[${index}] must be {label?: string, value: number, highlight?: boolean, valueLabel?: string}`,
      );
    }
    const { label, value, highlight, valueLabel } = datum as Record<
      keyof BarChartDatum,
      unknown
    >;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new Error(
        `${component}: data[${index}].value (${String(value)}) must be a finite number of at least 0`,
      );
    }
    for (const [key, text] of Object.entries({ label, valueLabel })) {
      if (text != null && typeof text !== 'string') {
        throw new Error(`${component}: data[${index}].${key} must be a string`);
      }
    }
    if (highlight != null && typeof highlight !== 'boolean') {
      throw new Error(
        `${component}: data[${index}].highlight must be a boolean`,
      );
    }
    return {
      value,
      ...(label != null ? { label: label as string } : {}),
      ...(highlight != null ? { highlight: highlight as boolean } : {}),
      ...(valueLabel != null ? { valueLabel: valueLabel as string } : {}),
    };
  });
};

/**
 * The value the full plot height stands for: `max` when given (every value
 * must fit under it), else the largest value. `0` when every bar is empty.
 */
export const barChartScale = (
  data: BarChartDatum[],
  max: number | undefined,
  component: string,
): number => {
  const largest = data.reduce((top, datum) => Math.max(top, datum.value), 0);
  if (max === undefined) return largest;
  if (!Number.isFinite(max) || max <= 0) {
    throw new Error(`${component}: max (${max}) must be a positive number`);
  }
  if (largest > max) {
    throw new Error(
      `${component}: a value (${largest}) exceeds max (${max}); raise max or leave it unset`,
    );
  }
  return max;
};

/** Fraction of the plot height a bar of `value` fills. */
export const barFraction = (value: number, scale: number): number =>
  scale > 0 ? value / scale : 0;

/**
 * Heights (fractions of the plot, from the bottom) of `count` guide lines
 * spaced evenly above the baseline, the last one at the top of the scale.
 */
export const barChartGridFractions = (count: number): number[] =>
  Array.from({ length: count }, (_, index) => (index + 1) / count);

/** The text a bar shows above itself with `showValues`. */
export const barValueText = (datum: BarChartDatum): string =>
  datum.valueLabel ?? String(datum.value);

/** The generated screen-reader summary: "Bar chart, 7 bars, highest Sat 48". */
export const barChartSummary = (data: BarChartDatum[]): string => {
  if (data.length === 0) return 'Bar chart, no bars';
  let top = 0;
  data.forEach((datum, index) => {
    if (datum.value > data[top].value) top = index;
  });
  const name = data[top].label ?? `bar ${top + 1}`;
  return `Bar chart, ${data.length} ${data.length === 1 ? 'bar' : 'bars'}, highest ${name} ${barValueText(data[top])}`;
};
