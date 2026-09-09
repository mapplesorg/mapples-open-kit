import { forwardRef, PropsWithChildren, useCallback, useState } from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  DISABLED_OPACITY,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
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

import {
  useControllableState,
  useOptionalFormField,
  useSlotColor,
} from '../../../internal';

import { defaults } from './defaults';
import { SLIDER_GEOMETRY } from './types';

/** Props for {@link Slider}. */
export interface SliderProps extends Omit<ViewProps, 'children'> {
  /** Current value (controlled). Omit to let the slider keep its own state. */
  value?: number;
  /** Initial value while uncontrolled. Defaults to `min`. */
  defaultValue?: number;
  /** Fires while dragging — the new value is the first argument. */
  onValueChange?: (value: number) => void;
  /** Fires once when the drag ends. */
  onSlidingComplete?: (value: number) => void;
  /** Lower bound. Defaults to `0`. */
  min?: number;
  /** Upper bound. Defaults to `100`. */
  max?: number;
  /** Snap increment. Defaults to `1`. */
  step?: number;
  /** Shows the current value above the thumb. */
  showValue?: boolean;
  /** Shows `min` and `max` under the track. */
  showBounds?: boolean;
  /** Colour role of the filled track and thumb. Defaults to `primary`. */
  tone?: Tone;
  /** Disables interaction and dims the control. */
  disabled?: boolean;
  /** Binds the value to a field of the enclosing `FormView`. */
  fieldName?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The whole control. */
    style?: StyledProp<ViewStyle>;
    /** The inactive track. */
    styleTrack?: StyledProp<ViewStyle>;
    /** The filled part of the track. */
    styleTrackFilled?: StyledProp<ViewStyle>;
    /** The thumb. */
    styleThumb?: StyledProp<ViewStyle>;
    /** The value label. */
    styleValueLabel?: StyledProp<TextStyle>;
    /** The min/max labels. */
    styleBoundsLabel?: StyledProp<TextStyle>;
  };
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const decimalsOf = (step: number) => {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
};

/**
 * A single-value slider over a continuous range (volume, a price cap, a
 * radius). Dragging or tapping the track sets the value, snapped to `step`;
 * the value is controlled through `value`/`onValueChange`, kept internally
 * when `value` is omitted, or bound to a form field through `fieldName`.
 * Drag input goes through react-native-gesture-handler, which every Mapples
 * app ships.
 *
 * @example
 * ```tsx
 * <Slider min={0} max={500} step={10} value={budget} onValueChange={setBudget} showValue />
 * ```
 *
 * @public
 */
const Slider = forwardRef<View, PropsWithChildren<SliderProps>>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      onSlidingComplete,
      min = 0,
      max = 100,
      step = 1,
      showValue = false,
      showBounds = false,
      tone = 'primary',
      disabled = false,
      fieldName,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (max <= min) {
      throw new Error(`Slider: max (${max}) must be greater than min (${min})`);
    }
    if (step <= 0) {
      throw new Error(`Slider: step (${step}) must be positive`);
    }

    const tones = useTones();
    const palette = tones.tone(tone);
    const field = useOptionalFormField<number>(fieldName);
    const [current, setCurrent] = useControllableState<number>({
      value: field.bound ? (field.value ?? min) : value,
      defaultValue: defaultValue ?? min,
      onChange: (next) => {
        field.setValue(next);
        onValueChange?.(next);
      },
    });
    const [trackWidth, setTrackWidth] = useState(0);

    const trackColor = useSlotColor(
      styled?.styleTrack,
      'backgroundColor',
      tones.outline,
    );
    const filledColor = useSlotColor(
      styled?.styleTrackFilled,
      'backgroundColor',
      palette.main,
    );
    const thumbColor = useSlotColor(
      styled?.styleThumb,
      'backgroundColor',
      palette.main,
    );

    const decimals = decimalsOf(step);
    const snap = useCallback(
      (raw: number) => {
        const stepped = Math.round((raw - min) / step) * step + min;
        return Number(clamp(stepped, min, max).toFixed(decimals));
      },
      [decimals, max, min, step],
    );

    const { thumb } = SLIDER_GEOMETRY;
    const usable = Math.max(trackWidth - thumb, 0);
    const fraction = (clamp(current, min, max) - min) / (max - min);

    const valueFromX = useCallback(
      (x: number) =>
        snap(min + clamp((x - thumb / 2) / usable, 0, 1) * (max - min)),
      [max, min, snap, thumb, usable],
    );

    const pan = Gesture.Pan()
      .enabled(!disabled && usable > 0)
      .minDistance(0)
      .runOnJS(true)
      .onBegin((event) => setCurrent(valueFromX(event.x)))
      .onUpdate((event) => setCurrent(valueFromX(event.x)))
      .onFinalize(() => onSlidingComplete?.(current));

    const onLayout = (event: LayoutChangeEvent) =>
      setTrackWidth(event.nativeEvent.layout.width);

    const onAccessibilityAction = (event: AccessibilityActionEvent) => {
      if (disabled) return;
      const direction = event.nativeEvent.actionName === 'increment' ? 1 : -1;
      const next = snap(current + direction * step);
      setCurrent(next);
      onSlidingComplete?.(next);
    };

    const valueText = current.toFixed(decimals);

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
        {showValue ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.label}
            style={[
              {
                color: tones.resolve(Tokens.color.text),
                alignSelf: 'flex-start',
              },
              usable > 0 && {
                transform: [{ translateX: fraction * usable }],
              },
              styled?.styleValueLabel,
            ]}
          >
            {valueText}
          </Typography>
        ) : null}
        <GestureDetector gesture={pan}>
          <StyledView
            accessibilityRole="adjustable"
            accessibilityValue={{ min, max, now: current, text: valueText }}
            accessibilityActions={[
              { name: 'increment' },
              { name: 'decrement' },
            ]}
            accessibilityState={{ disabled }}
            onAccessibilityAction={onAccessibilityAction}
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
                    backgroundColor: trackColor,
                  },
                  styled?.styleTrack,
                ],
              }}
            >
              <StyledView
                styled={{
                  style: [
                    defaults.filled,
                    {
                      width: `${fraction * 100}%`,
                      backgroundColor: filledColor,
                    },
                    styled?.styleTrackFilled,
                  ],
                }}
              />
            </StyledView>
            <StyledView
              pointerEvents="none"
              styled={{
                style: [
                  defaults.thumb,
                  {
                    width: thumb,
                    height: thumb,
                    borderRadius: thumb / 2,
                    left: fraction * usable,
                    backgroundColor: thumbColor,
                  },
                  styled?.styleThumb,
                ],
              }}
            />
          </StyledView>
        </GestureDetector>
        {showBounds ? (
          <StyledView styled={{ style: defaults.bounds }}>
            {[min, max].map((bound) => (
              <Typography
                key={bound}
                variant={TYPOGRAPHY_PARTS.helper}
                style={[
                  { color: tones.resolve(Tokens.color.textSecondary) },
                  styled?.styleBoundsLabel,
                ]}
              >
                {bound.toFixed(decimals)}
              </Typography>
            ))}
          </StyledView>
        ) : null}
      </StyledView>
    );
  },
);
Slider.displayName = 'Slider';

export default Slider;
