import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useRef,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  DISABLED_OPACITY,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useShape,
  useTones,
} from '@mapples/ui';
import {
  AccessibilityActionEvent,
  LayoutChangeEvent,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useControllableState } from '../../../internal';
import { SLIDER_GEOMETRY } from '../Slider/types';

import { defaults } from './defaults';
import {
  checkRangeBounds,
  histogramBarInRange,
  nearestRangeThumb,
  RANGE_SLIDER_BAR_GAP,
  RANGE_SLIDER_DEFAULTS,
  rangeDecimalsOf,
  RangeSliderThumb,
  RangeSliderValue,
  readRangeHistogram,
  readRangeValue,
} from './types';

/** Props for {@link RangeSlider}. */
export interface RangeSliderProps extends Omit<ViewProps, 'children'> {
  /** Selected range `[low, high]` (controlled). Omit to let the slider keep its own state. */
  value?: RangeSliderValue;
  /** Initial range while uncontrolled. Defaults to `[min, max]`. */
  defaultValue?: RangeSliderValue;
  /** Fires while dragging — the new `[low, high]` is the first argument. */
  onValueChange?: (value: RangeSliderValue) => void;
  /** Fires once when a drag ends, with the final `[low, high]`. */
  onSlidingComplete?: (value: RangeSliderValue) => void;
  /** Lower bound. Defaults to `0`. */
  min?: number;
  /** Upper bound; must be greater than `min`. Defaults to `100`. */
  max?: number;
  /** Snap increment; must be positive. Defaults to `1`. */
  step?: number;
  /** Smallest gap the thumbs keep between them. Defaults to `0` (they may meet, never cross). */
  minDistance?: number;
  /** Bar heights drawn above the track, spread evenly from `min` to `max` (a price distribution); bars inside the range take the tone. */
  histogram?: number[];
  /** Height of the histogram in points. Defaults to `48`. */
  histogramHeight?: number;
  /** Shows the selected low and high values under the track. */
  showLabels?: boolean;
  /** Text before every shown and spoken value ('€'). */
  prefix?: string;
  /** Text after every shown and spoken value ('K'). */
  suffix?: string;
  /** Screen-reader names of the low and high thumbs. Defaults to `['Minimum', 'Maximum']`. */
  thumbLabels?: [string, string];
  /** Colour role of the range, thumbs and in-range bars. Defaults to `primary`. */
  tone?: Tone;
  /** Disables interaction and dims the control. */
  disabled?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The whole control. */
    style?: StyledProp<ViewStyle>;
    /** The inactive track. */
    styleTrack?: StyledProp<ViewStyle>;
    /** The selected part of the track between the thumbs. */
    styleRange?: StyledProp<ViewStyle>;
    /** Both thumbs. */
    styleThumb?: StyledProp<ViewStyle>;
    /** Every histogram bar (its `backgroundColor` overrides the muted colour). */
    styleHistogramBar?: StyledProp<ViewStyle>;
    /** The histogram bars inside the range, merged over `styleHistogramBar`. */
    styleHistogramBarInRange?: StyledProp<ViewStyle>;
    /** The low/high value labels. */
    styleLabel?: StyledProp<TextStyle>;
  };
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * A two-thumb slider selecting a range (a price filter, an age bracket).
 * Dragging or tapping moves the nearer thumb, snapped to `step`; the thumbs
 * never cross and keep `minDistance` apart. An optional `histogram` draws the
 * distribution above the track, its bars inside the range in the tone. The
 * value is controlled through `value`/`onValueChange` or kept internally.
 * Each thumb is its own adjustable element for screen readers.
 *
 * @example
 * ```tsx
 * <RangeSlider
 *   min={200}
 *   max={3000}
 *   step={50}
 *   value={price}
 *   onValueChange={setPrice}
 *   prefix="€"
 *   suffix="K"
 *   showLabels
 * />
 * ```
 *
 * @public
 */
const RangeSlider: ForwardRefExoticComponent<
  PropsWithChildren<RangeSliderProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<RangeSliderProps>>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      onSlidingComplete,
      min = 0,
      max = 100,
      step = 1,
      minDistance = 0,
      histogram,
      histogramHeight = RANGE_SLIDER_DEFAULTS.histogramHeight,
      showLabels = false,
      prefix = '',
      suffix = '',
      thumbLabels = RANGE_SLIDER_DEFAULTS.thumbLabels,
      tone = 'primary',
      disabled = false,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    checkRangeBounds(min, max, step, minDistance);
    const bars =
      histogram === undefined ? undefined : readRangeHistogram(histogram);
    if (bars && !(histogramHeight > 0)) {
      throw new Error(
        `RangeSlider: histogramHeight (${histogramHeight}) must be positive`,
      );
    }
    if (
      !Array.isArray(thumbLabels) ||
      thumbLabels.length !== 2 ||
      !thumbLabels.every((label) => typeof label === 'string')
    ) {
      throw new Error('RangeSlider: thumbLabels must be two strings');
    }
    const initial =
      defaultValue === undefined
        ? ([min, max] as RangeSliderValue)
        : readRangeValue(defaultValue, 'defaultValue', min, max, minDistance);
    const controlled =
      value === undefined
        ? undefined
        : readRangeValue(value, 'value', min, max, minDistance);

    const tones = useTones();
    const shape = useShape();
    const palette = tones.tone(tone);
    const [current, setCurrent] = useControllableState<RangeSliderValue>({
      value: controlled,
      defaultValue: initial,
      onChange: onValueChange,
    });
    const [trackWidth, setTrackWidth] = useState(0);
    // The thumb the running drag moves, picked when the touch begins.
    const active = useRef<RangeSliderThumb>(0);

    const decimals = rangeDecimalsOf(step);
    const tidy = useCallback(
      (raw: number) => Number(raw.toFixed(decimals)),
      [decimals],
    );
    const snap = useCallback(
      (raw: number) =>
        tidy(clamp(Math.round((raw - min) / step) * step + min, min, max)),
      [max, min, step, tidy],
    );

    const { thumb } = SLIDER_GEOMETRY;
    const usable = Math.max(trackWidth - thumb, 0);
    const [low, high] = current;
    const fractionOf = (part: number) => (part - min) / (max - min);

    /** `[low, high]` with thumb `which` moved to `raw`, kept from crossing. */
    const moved = useCallback(
      (which: RangeSliderThumb, raw: number): RangeSliderValue => {
        const target = snap(raw);
        return which === 0
          ? [tidy(clamp(target, min, high - minDistance)), high]
          : [low, tidy(clamp(target, low + minDistance, max))];
      },
      [high, low, max, min, minDistance, snap, tidy],
    );

    const commit = (next: RangeSliderValue) => {
      if (next[0] !== low || next[1] !== high) setCurrent(next);
    };

    const valueFromX = (x: number) =>
      min + clamp((x - thumb / 2) / usable, 0, 1) * (max - min);

    const dragTo = (x: number) => {
      const raw = valueFromX(x);
      // Thumbs on one spot: the drag direction decides which one moves.
      if (low === high) active.current = raw < low ? 0 : 1;
      commit(moved(active.current, raw));
    };

    const pan = Gesture.Pan()
      .enabled(!disabled && usable > 0)
      .minDistance(0)
      .runOnJS(true)
      .onBegin((event) => {
        active.current = nearestRangeThumb(valueFromX(event.x), current);
        dragTo(event.x);
      })
      .onUpdate((event) => dragTo(event.x))
      .onFinalize(() => onSlidingComplete?.(current));

    const onLayout = (event: LayoutChangeEvent) =>
      setTrackWidth(event.nativeEvent.layout.width);

    const text = (part: number) =>
      `${prefix}${part.toFixed(decimals)}${suffix}`;

    const onThumbAction =
      (which: RangeSliderThumb) => (event: AccessibilityActionEvent) => {
        if (disabled) return;
        const direction = event.nativeEvent.actionName === 'increment' ? 1 : -1;
        const next = moved(which, current[which] + direction * step);
        commit(next);
        onSlidingComplete?.(next);
      };

    const thumbColor = palette.main;
    const tallest = bars ? Math.max(...bars) : 0;

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.root,
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {bars ? (
          <StyledView
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            styled={{
              style: [
                defaults.histogram,
                { height: histogramHeight, marginHorizontal: thumb / 2 },
              ],
            }}
          >
            {bars.map((count, index) => {
              const inRange = histogramBarInRange(
                index,
                bars.length,
                current,
                min,
                max,
              );
              return (
                <StyledView
                  key={index}
                  styled={{
                    style: [
                      defaults.bar,
                      {
                        height:
                          tallest > 0 ? (count / tallest) * histogramHeight : 0,
                        marginHorizontal: RANGE_SLIDER_BAR_GAP / 2,
                        borderTopLeftRadius: shape.radius.xs,
                        borderTopRightRadius: shape.radius.xs,
                        backgroundColor: inRange
                          ? palette.main
                          : tones.fillStrong,
                      },
                      styled?.styleHistogramBar,
                      inRange && styled?.styleHistogramBarInRange,
                    ],
                  }}
                />
              );
            })}
          </StyledView>
        ) : null}
        <GestureDetector gesture={pan}>
          <StyledView
            onLayout={onLayout}
            styled={{
              style: [defaults.row, { height: SLIDER_GEOMETRY.rowHeight }],
            }}
          >
            <StyledView
              pointerEvents="none"
              styled={{
                style: [
                  defaults.track,
                  {
                    height: SLIDER_GEOMETRY.track,
                    borderRadius: SLIDER_GEOMETRY.track / 2,
                    marginHorizontal: thumb / 2,
                    backgroundColor: tones.outline,
                  },
                  styled?.styleTrack,
                ],
              }}
            >
              <StyledView
                styled={{
                  style: [
                    defaults.range,
                    {
                      left: `${fractionOf(low) * 100}%`,
                      width: `${(fractionOf(high) - fractionOf(low)) * 100}%`,
                      backgroundColor: palette.main,
                    },
                    styled?.styleRange,
                  ],
                }}
              />
            </StyledView>
            {current.map((part, index) => {
              const which = index as RangeSliderThumb;
              return (
                <StyledView
                  key={which}
                  accessible
                  accessibilityRole="adjustable"
                  accessibilityLabel={`${thumbLabels[which]}, ${text(part)}`}
                  accessibilityValue={{ min, max, now: part, text: text(part) }}
                  accessibilityActions={[
                    { name: 'increment' },
                    { name: 'decrement' },
                  ]}
                  accessibilityState={{ disabled }}
                  onAccessibilityAction={onThumbAction(which)}
                  styled={{
                    style: [
                      defaults.thumb,
                      {
                        width: thumb,
                        height: thumb,
                        borderRadius: thumb / 2,
                        left: fractionOf(part) * usable,
                        backgroundColor: thumbColor,
                      },
                      styled?.styleThumb,
                    ],
                  }}
                />
              );
            })}
          </StyledView>
        </GestureDetector>
        {showLabels ? (
          <StyledView
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            styled={{ style: defaults.labels }}
          >
            {current.map((part, index) => (
              <Typography
                key={index}
                variant={TYPOGRAPHY_PARTS.helper}
                style={[
                  { color: tones.resolve(Tokens.color.textSecondary) },
                  styled?.styleLabel,
                ]}
              >
                {text(part)}
              </Typography>
            ))}
          </StyledView>
        ) : null}
      </StyledView>
    );
  },
);
RangeSlider.displayName = 'RangeSlider';

export default RangeSlider;
