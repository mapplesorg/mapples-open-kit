import {
  forwardRef,
  PropsWithChildren,
  useId,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { Tokens, Tone, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import {
  LayoutChangeEvent,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  evenIndices,
  LINE_CHART_AREA_OPACITY,
  LINE_CHART_GUIDE_DASH,
  LINE_CHART_MARKER_RADIUS,
  LINE_CHART_MARKER_RING,
  LineChartDatum,
  lineChartAreaPath,
  lineChartDomain,
  lineChartGridYs,
  lineChartPath,
  lineChartPoints,
  lineChartSummary,
  readLineChartData,
} from './types';

type ColorSlot = StyledProp<ViewStyle & { color?: string }>;

/** Props for {@link LineChart}. */
export interface LineChartProps extends Omit<ViewProps, 'children'> {
  /** The series, oldest first: `[{ value, label? }]`; at least 2 finite values. Required: missing data throws. */
  data?: LineChartDatum[];
  /** Value at the bottom of the plot. Defaults to the lowest value minus 10% of the range (not below 0 for non-negative data). */
  min?: number;
  /** Value at the top of the plot. Defaults to the highest value plus 10% of the range. */
  max?: number;
  /** Plot height in points (without the x labels). Defaults to `180`. */
  height?: number;
  /** Fills under the line with the tone, fading to transparent at the bottom. */
  area?: boolean;
  /** Draws a monotone curve through the points instead of straight segments. */
  smooth?: boolean;
  /** Line thickness in points. Defaults to `2`. */
  strokeWidth?: number;
  /** Number of horizontal guide lines from the bottom to the top of the plot. Defaults to `3`. */
  gridLines?: number;
  /** Puts a dot on the last point. */
  showEndMarker?: boolean;
  /** Index of a point to mark with a dashed vertical guide and a dot ('today'). */
  markerIndex?: number;
  /** Labels spread evenly under the plot, first to last; replaces the points' own labels. */
  xLabels?: string[];
  /** How many point labels to show, spread evenly from first to last (`0` hides them). Defaults to `4`. */
  xLabelCount?: number;
  /** Colour role of the line, area and markers. Defaults to `primary`. */
  tone?: Tone;
  /** Screen-reader summary. Defaults to "Line chart, 30 points, from 1240 to 1860". */
  accessibilityLabel?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The chart box. */
    style?: StyledProp<ViewStyle>;
    /** The line (its `color` is the stroke colour). */
    styleLine?: ColorSlot;
    /** The area fill (its `color` is the fill colour at the line). */
    styleArea?: ColorSlot;
    /** The guide lines (their `color`). */
    styleGrid?: ColorSlot;
    /** The end and guide markers (their `color` is the dot colour). */
    styleMarker?: ColorSlot;
    /** The x labels. */
    styleLabel?: StyledProp<TextStyle>;
  };
}

/**
 * A value history drawn as a line — a balance over a month, weight over a
 * quarter — with an optional fading area, guide lines, a marked point and a
 * few x labels. It takes the width of its container (measured on layout).
 *
 * @example
 * ```tsx
 * <LineChart
 *   area
 *   smooth
 *   showEndMarker
 *   data={[
 *     { value: 1240, label: 'Sep 1' },
 *     { value: 1410 },
 *     { value: 1380, label: 'Sep 3' },
 *   ]}
 * />
 * ```
 *
 * @public
 */
const LineChart: ForwardRefExoticComponent<
  PropsWithChildren<LineChartProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<LineChartProps>>(
  (
    {
      data,
      min,
      max,
      height = 180,
      area = false,
      smooth = false,
      strokeWidth = 2,
      gridLines = 3,
      showEndMarker = false,
      markerIndex,
      xLabels,
      xLabelCount = 4,
      tone = 'primary',
      accessibilityLabel,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const points = readLineChartData(data, 'LineChart');
    const domain = lineChartDomain(
      points.map((point) => point.value),
      min,
      max,
      'LineChart',
    );
    if (!(height > 0)) {
      throw new Error(`LineChart: height (${height}) must be positive`);
    }
    if (!(strokeWidth > 0)) {
      throw new Error(
        `LineChart: strokeWidth (${strokeWidth}) must be positive`,
      );
    }
    for (const [key, count] of Object.entries({ gridLines, xLabelCount })) {
      if (!Number.isInteger(count) || count < 0) {
        throw new Error(
          `LineChart: ${key} (${count}) must be a whole number of at least 0`,
        );
      }
    }
    if (
      markerIndex !== undefined &&
      (!Number.isInteger(markerIndex) ||
        markerIndex < 0 ||
        markerIndex >= points.length)
    ) {
      throw new Error(
        `LineChart: markerIndex (${markerIndex}) must be the index of a point (0–${points.length - 1})`,
      );
    }
    if (
      xLabels !== undefined &&
      (!Array.isArray(xLabels) ||
        xLabels.some((label) => typeof label !== 'string'))
    ) {
      throw new Error('LineChart: xLabels must be an array of strings');
    }

    const [width, setWidth] = useState(0);
    const gradientId = `line-chart-area-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const tones = useTones();
    const palette = tones.tone(tone);
    const lineColor = useSlotColor(styled?.styleLine, 'color', palette.main);
    const areaColor = useSlotColor(styled?.styleArea, 'color', palette.main);
    const gridColor = useSlotColor(styled?.styleGrid, 'color', tones.divider);
    const markerColor = useSlotColor(
      styled?.styleMarker,
      'color',
      palette.main,
    );
    const ringColor = tones.resolve(Tokens.color.surface);
    const secondary = tones.resolve(Tokens.color.textSecondary);

    const onLayout = (event: LayoutChangeEvent) =>
      setWidth(event.nativeEvent.layout.width);

    // Room on every edge so the stroke and the markers are never clipped.
    const inset = Math.max(
      strokeWidth,
      LINE_CHART_MARKER_RADIUS + LINE_CHART_MARKER_RING,
    );
    const xy = lineChartPoints(
      points.map((point) => point.value),
      domain,
      width,
      height,
      inset,
    );
    const last = xy[xy.length - 1];
    const marked = markerIndex === undefined ? undefined : xy[markerIndex];

    // Each label sits centred under its point in a box 1/count of the
    // width, kept inside the chart at both ends.
    const labels: { text: string; x: number }[] = xLabels
      ? xLabels.map((text, k) => ({
          text,
          x:
            xLabels.length === 1
              ? inset
              : inset + ((width - inset * 2) * k) / (xLabels.length - 1),
        }))
      : evenIndices(points.length, xLabelCount).flatMap((index) => {
          const text = points[index].label;
          return text === undefined ? [] : [{ text, x: xy[index].x }];
        });
    const labelBox = labels.length > 0 ? width / labels.length : 0;

    const dot = (point: { x: number; y: number }) => (
      <Circle
        cx={point.x}
        cy={point.y}
        r={LINE_CHART_MARKER_RADIUS}
        fill={markerColor}
        stroke={ringColor}
        strokeWidth={LINE_CHART_MARKER_RING}
      />
    );

    return (
      <StyledView
        ref={ref}
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel ?? lineChartSummary(points)}
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        <StyledView
          onLayout={onLayout}
          styled={{ style: [defaults.plot, { height }] }}
        >
          {width > 0 ? (
            <Svg width={width} height={height}>
              {area ? (
                <Defs>
                  <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <Stop
                      offset="0"
                      stopColor={areaColor}
                      stopOpacity={LINE_CHART_AREA_OPACITY}
                    />
                    <Stop offset="1" stopColor={areaColor} stopOpacity={0} />
                  </LinearGradient>
                </Defs>
              ) : null}
              {lineChartGridYs(gridLines, height, inset).map((y) => (
                <Line
                  key={y}
                  x1={0}
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke={gridColor}
                  strokeWidth={1}
                />
              ))}
              {area ? (
                <Path
                  d={lineChartAreaPath(xy, smooth, height - inset)}
                  fill={`url(#${gradientId})`}
                />
              ) : null}
              <Path
                d={lineChartPath(xy, smooth)}
                fill="none"
                stroke={lineColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {marked ? (
                <Line
                  x1={marked.x}
                  y1={inset}
                  x2={marked.x}
                  y2={height - inset}
                  stroke={tones.outlineStrong}
                  strokeWidth={1}
                  strokeDasharray={LINE_CHART_GUIDE_DASH}
                />
              ) : null}
              {marked ? dot(marked) : null}
              {showEndMarker && markerIndex !== xy.length - 1
                ? dot(last)
                : null}
            </Svg>
          ) : null}
        </StyledView>
        {labels.length > 0 ? (
          <StyledView styled={{ style: defaults.labels }}>
            <Typography
              variant={TYPOGRAPHY_PARTS.helper}
              numberOfLines={1}
              style={[defaults.labelSpacer, styled?.styleLabel]}
            >
              {labels[0].text}
            </Typography>
            {width > 0
              ? labels.map((label, index) => {
                  const left = Math.min(
                    Math.max(label.x - labelBox / 2, 0),
                    width - labelBox,
                  );
                  return (
                    <Typography
                      key={index}
                      variant={TYPOGRAPHY_PARTS.helper}
                      numberOfLines={1}
                      style={[
                        defaults.label,
                        {
                          left,
                          width: labelBox,
                          color: secondary,
                          textAlign:
                            left <= 0
                              ? 'left'
                              : left >= width - labelBox
                                ? 'right'
                                : 'center',
                        },
                        styled?.styleLabel,
                      ]}
                    >
                      {label.text}
                    </Typography>
                  );
                })
              : null}
          </StyledView>
        ) : null}
      </StyledView>
    );
  },
);
LineChart.displayName = 'LineChart';

export default LineChart;
