/** One point of a {@link LineChart}. */
export interface LineChartDatum {
  /** The value; finite. */
  value: number;
  /** Text under the point when it is one of the shown x labels ('Sep 1'). */
  label?: string;
}

/** A point in the chart's SVG space. */
export interface ChartPoint {
  x: number;
  y: number;
}

/** The value range the plot spans, bottom to top. */
export interface LineChartDomain {
  min: number;
  max: number;
}

/** Share of the data range added above and below it when `min`/`max` are unset. */
export const LINE_CHART_HEADROOM = 0.1;

/** Radius of the end and guide markers. */
export const LINE_CHART_MARKER_RADIUS = 4;

/** Width of the surface-coloured ring around a marker. */
export const LINE_CHART_MARKER_RING = 2;

/** Opacity of the area fill at the line; it fades to transparent at the bottom. */
export const LINE_CHART_AREA_OPACITY = 0.24;

/** Dash and gap of the guide line at `markerIndex`. */
export const LINE_CHART_GUIDE_DASH = [4, 4];

/**
 * The points a chart renders. A malformed entry is a data error — it is
 * reported, never silently skipped, so an author sees which point is wrong.
 */
export const readLineChartData = (
  data: unknown,
  component: string,
): LineChartDatum[] => {
  if (!Array.isArray(data) || data.length < 2) {
    throw new Error(
      `${component}: data must be an array of at least 2 points {value, label?}`,
    );
  }
  data.forEach((datum, index) => {
    if (typeof datum !== 'object' || datum === null) {
      throw new Error(
        `${component}: data[${index}] must be {value: number, label?: string}`,
      );
    }
    const { value, label } = datum as LineChartDatum;
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(
        `${component}: data[${index}].value (${String(value)}) must be a finite number`,
      );
    }
    if (label !== undefined && typeof label !== 'string') {
      throw new Error(`${component}: data[${index}].label must be a string`);
    }
  });
  return data as LineChartDatum[];
};

/**
 * The value range of the plot. Unset bounds follow the data with
 * {@link LINE_CHART_HEADROOM} of its range on each side (never below 0 for
 * data that is not negative); a flat series gets a range around its value.
 * Explicit bounds must hold every value.
 */
export const lineChartDomain = (
  values: number[],
  min: number | undefined,
  max: number | undefined,
  component: string,
): LineChartDomain => {
  for (const [key, bound] of Object.entries({ min, max })) {
    if (bound !== undefined && !Number.isFinite(bound)) {
      throw new Error(
        `${component}: ${key} (${bound}) must be a finite number`,
      );
    }
  }
  const low = Math.min(...values);
  const high = Math.max(...values);
  if (min !== undefined && low < min) {
    throw new Error(
      `${component}: a value (${low}) is below min (${min}); lower min or leave it unset`,
    );
  }
  if (max !== undefined && high > max) {
    throw new Error(
      `${component}: a value (${high}) exceeds max (${max}); raise max or leave it unset`,
    );
  }
  const span = high - low || Math.abs(high) || 1;
  const pad = span * LINE_CHART_HEADROOM;
  const bottom = min ?? (low >= 0 ? Math.max(0, low - pad) : low - pad);
  const top = max ?? high + pad;
  if (!(top > bottom)) {
    throw new Error(
      `${component}: max (${top}) must be greater than min (${bottom})`,
    );
  }
  return { min: bottom, max: top };
};

/**
 * The points of `values` spread evenly across `width`, `inset` points in
 * from every edge of the `width` × `height` box.
 */
export const lineChartPoints = (
  values: number[],
  domain: LineChartDomain,
  width: number,
  height: number,
  inset: number,
): ChartPoint[] => {
  const plotWidth = width - inset * 2;
  const plotHeight = height - inset * 2;
  const step = plotWidth / (values.length - 1);
  return values.map((value, index) => ({
    x: inset + step * index,
    y:
      inset +
      plotHeight * (1 - (value - domain.min) / (domain.max - domain.min)),
  }));
};

const round = (n: number): number => Math.round(n * 100) / 100;

/**
 * Tangents of a monotone cubic through `points` (Fritsch–Carlson): the
 * curve never overshoots between two points, so no fake peaks appear.
 */
const monotoneTangents = (points: ChartPoint[]): number[] => {
  const count = points.length;
  const slopes: number[] = [];
  for (let i = 0; i < count - 1; i++) {
    slopes.push(
      (points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x),
    );
  }
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === count - 1) return slopes[count - 2];
    return slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
  });
  for (let i = 0; i < count - 1; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = tangents[i] / slopes[i];
    const b = tangents[i + 1] / slopes[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      tangents[i] = t * a * slopes[i];
      tangents[i + 1] = t * b * slopes[i];
    }
  }
  return tangents;
};

/** SVG path data of the line through `points`: straight segments, or a monotone cubic with `smooth`. */
export const lineChartPath = (
  points: ChartPoint[],
  smooth: boolean,
): string => {
  const [first, ...others] = points;
  let path = `M${round(first.x)} ${round(first.y)}`;
  if (!smooth) {
    for (const point of others) path += `L${round(point.x)} ${round(point.y)}`;
    return path;
  }
  const tangents = monotoneTangents(points);
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    const third = (to.x - from.x) / 3;
    path +=
      `C${round(from.x + third)} ${round(from.y + tangents[i] * third)} ` +
      `${round(to.x - third)} ${round(to.y - tangents[i + 1] * third)} ` +
      `${round(to.x)} ${round(to.y)}`;
  }
  return path;
};

/** SVG path data of the area between the line and the horizontal `bottom`. */
export const lineChartAreaPath = (
  points: ChartPoint[],
  smooth: boolean,
  bottom: number,
): string => {
  const first = points[0];
  const last = points[points.length - 1];
  return (
    lineChartPath(points, smooth) +
    `L${round(last.x)} ${round(bottom)}L${round(first.x)} ${round(bottom)}Z`
  );
};

/**
 * Vertical positions of `count` guide lines spread evenly from the bottom
 * of the plot to its top (one line sits at the bottom).
 */
export const lineChartGridYs = (
  count: number,
  height: number,
  inset: number,
): number[] => {
  const bottom = height - inset;
  if (count === 1) return [bottom];
  const step = (height - inset * 2) / (count - 1);
  return Array.from({ length: count }, (_, index) => bottom - step * index);
};

/** Indices of `count` points spread evenly from the first to the last of `total`. */
export const evenIndices = (total: number, count: number): number[] => {
  if (count <= 0) return [];
  if (count === 1) return [0];
  if (count >= total) return Array.from({ length: total }, (_, i) => i);
  return Array.from({ length: count }, (_, k) =>
    Math.round((k * (total - 1)) / (count - 1)),
  );
};

/** The generated screen-reader summary: "Line chart, 30 points, from 1240 (Sep 1) to 1860 (Sep 30)". */
export const lineChartSummary = (data: LineChartDatum[]): string => {
  const describe = (datum: LineChartDatum) =>
    datum.label ? `${datum.value} (${datum.label})` : String(datum.value);
  return `Line chart, ${data.length} points, from ${describe(data[0])} to ${describe(data[data.length - 1])}`;
};
