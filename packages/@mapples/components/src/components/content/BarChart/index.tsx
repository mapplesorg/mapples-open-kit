import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useShape,
  useTones,
} from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { defaults } from './defaults';
import {
  BAR_CHART_LINE,
  BAR_CHART_VALUE_SPACE,
  BarChartDatum,
  barChartGridFractions,
  barChartScale,
  barChartSummary,
  barFraction,
  barValueText,
  readBarChartData,
} from './types';

/** Props for {@link BarChart}. */
export interface BarChartProps extends Omit<ViewProps, 'children'> {
  /** The bars, left to right: `[{ label?, value, highlight?, valueLabel? }]`; values finite and ≥ 0. Required: missing or empty data throws. */
  data?: BarChartDatum[];
  /** The value of a full-height bar. Defaults to the largest value; every value must fit under it. */
  max?: number;
  /** Plot height in points (bars only, without value and category labels). Defaults to `160`. */
  height?: number;
  /** Shows each bar's value (or its `valueLabel`) above it. */
  showValues?: boolean;
  /** Shows the category labels under the bars. Defaults to `true`. */
  showLabels?: boolean;
  /** Corner radius of the bars' top corners. Defaults to the project's small radius. */
  barRadius?: number;
  /** Share of each slot the bar fills, above 0 up to 1; the rest is the gap. Defaults to `0.6`. */
  barWidthRatio?: number;
  /** Colour role of the bars. Defaults to `primary`. */
  tone?: Tone;
  /** Colour role of the bars marked `highlight`. Defaults to `accent`. */
  highlightTone?: Tone;
  /** Draws the line the bars stand on. Defaults to `true`. */
  showBaseline?: boolean;
  /** Number of horizontal guide lines spaced evenly up to `max`. Defaults to `0`. */
  gridLines?: number;
  /** Fires with the bar's index when a bar is pressed. */
  onBarPress?: (index: number) => void;
  /** Screen-reader summary. Defaults to "Bar chart, 7 bars, highest Sat 48". */
  accessibilityLabel?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The chart box. */
    style?: StyledProp<ViewStyle>;
    /** Every bar (its `backgroundColor` overrides the tone). */
    styleBar?: StyledProp<ViewStyle>;
    /** The highlighted bars, merged over `styleBar`. */
    styleBarHighlight?: StyledProp<ViewStyle>;
    /** The value labels above the bars. */
    styleValue?: StyledProp<TextStyle>;
    /** The category labels under the bars. */
    styleLabel?: StyledProp<TextStyle>;
    /** The baseline. */
    styleBaseline?: StyledProp<ViewStyle>;
    /** The guide lines. */
    styleGrid?: StyledProp<ViewStyle>;
  };
}

/**
 * Vertical bars for a handful of categories — weekly activity, habit
 * streaks, a price histogram. Bars scale to `max` (the largest value by
 * default) and share the width evenly, so the chart fits any container
 * without measuring. Bars marked `highlight` take `highlightTone`; the rest
 * take `tone` (restyle them through `styleBar` for a muted look).
 *
 * @example
 * ```tsx
 * <BarChart
 *   showValues
 *   data={[
 *     { label: 'Mon', value: 32 },
 *     { label: 'Tue', value: 45 },
 *     { label: 'Wed', value: 18, highlight: true },
 *   ]}
 * />
 * ```
 *
 * @public
 */
const BarChart: ForwardRefExoticComponent<
  PropsWithChildren<BarChartProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<BarChartProps>>(
  (
    {
      data,
      max,
      height = 160,
      showValues = false,
      showLabels = true,
      barRadius,
      barWidthRatio = 0.6,
      tone = 'primary',
      highlightTone = 'accent',
      showBaseline = true,
      gridLines = 0,
      onBarPress,
      accessibilityLabel,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const bars = readBarChartData(data, 'BarChart');
    const scale = barChartScale(bars, max, 'BarChart');
    if (!(height > 0)) {
      throw new Error(`BarChart: height (${height}) must be positive`);
    }
    if (!(barWidthRatio > 0 && barWidthRatio <= 1)) {
      throw new Error(
        `BarChart: barWidthRatio (${barWidthRatio}) must be above 0 and at most 1`,
      );
    }
    if (!Number.isInteger(gridLines) || gridLines < 0) {
      throw new Error(
        `BarChart: gridLines (${gridLines}) must be a whole number of at least 0`,
      );
    }
    if (barRadius !== undefined && !(barRadius >= 0)) {
      throw new Error(`BarChart: barRadius (${barRadius}) must be at least 0`);
    }

    const tones = useTones();
    const shape = useShape();
    const palette = tones.tone(tone);
    const accent = tones.tone(highlightTone);
    const text = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const radius = barRadius ?? shape.radius.sm;
    const Column = onBarPress ? StyledPressable : StyledView;
    const anyLabel = bars.some((bar) => bar.label !== undefined);

    return (
      <StyledView
        ref={ref}
        accessible={!onBarPress}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel ?? barChartSummary(bars)}
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        <StyledView
          styled={{
            style: [
              defaults.plot,
              {
                height: height + (showValues ? BAR_CHART_VALUE_SPACE : 0),
              },
            ],
          }}
        >
          {barChartGridFractions(gridLines).map((fraction) => (
            <StyledView
              key={fraction}
              pointerEvents="none"
              styled={{
                style: [
                  defaults.grid,
                  {
                    bottom: Math.max(0, fraction * height - BAR_CHART_LINE),
                    height: BAR_CHART_LINE,
                    backgroundColor: tones.divider,
                  },
                  styled?.styleGrid,
                ],
              }}
            />
          ))}
          {bars.map((bar, index) => {
            const highlighted = !!bar.highlight;
            return (
              <Column
                key={index}
                accessibilityRole={onBarPress ? 'button' : undefined}
                accessibilityLabel={
                  onBarPress
                    ? [bar.label, barValueText(bar)].filter(Boolean).join(' ')
                    : undefined
                }
                onPress={onBarPress ? () => onBarPress(index) : undefined}
                styled={{ style: defaults.column }}
              >
                {showValues ? (
                  <Typography
                    variant={TYPOGRAPHY_PARTS.helper}
                    numberOfLines={1}
                    style={[
                      defaults.value,
                      { color: highlighted ? accent.ink : secondary },
                      styled?.styleValue,
                    ]}
                  >
                    {barValueText(bar)}
                  </Typography>
                ) : null}
                <StyledView
                  styled={{
                    style: [
                      {
                        width: `${barWidthRatio * 100}%`,
                        height: barFraction(bar.value, scale) * height,
                        borderTopLeftRadius: radius,
                        borderTopRightRadius: radius,
                        backgroundColor: highlighted
                          ? accent.main
                          : palette.main,
                      },
                      styled?.styleBar,
                      highlighted && styled?.styleBarHighlight,
                    ],
                  }}
                />
              </Column>
            );
          })}
        </StyledView>
        {showBaseline ? (
          <StyledView
            styled={{
              style: [
                { height: BAR_CHART_LINE, backgroundColor: tones.outline },
                styled?.styleBaseline,
              ],
            }}
          />
        ) : null}
        {showLabels && anyLabel ? (
          <StyledView styled={{ style: defaults.labels }}>
            {bars.map((bar, index) => (
              <Typography
                key={index}
                variant={TYPOGRAPHY_PARTS.helper}
                numberOfLines={1}
                style={[
                  defaults.label,
                  { color: bar.highlight ? text : secondary },
                  styled?.styleLabel,
                ]}
              >
                {bar.label ?? ''}
              </Typography>
            ))}
          </StyledView>
        ) : null}
      </StyledView>
    );
  },
);
BarChart.displayName = 'BarChart';

export default BarChart;
