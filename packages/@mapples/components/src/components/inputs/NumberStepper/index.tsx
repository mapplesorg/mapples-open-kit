import { forwardRef, PropsWithChildren, useCallback } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  CONTROL_SIZES,
  DISABLED_OPACITY,
  RADII,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import {
  AccessibilityActionEvent,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import {
  Glyph,
  useControllableState,
  useOptionalFormField,
  useSlotColor,
} from '../../../internal';

import { defaults } from './defaults';
import { NumberStepperSize } from './types';

/** Props for {@link NumberStepper}. */
export interface NumberStepperProps extends Omit<ViewProps, 'children'> {
  /** Current value (controlled). Omit to let the stepper keep its own state. */
  value?: number;
  /** Initial value while uncontrolled. Defaults to `min` or `0`. */
  defaultValue?: number;
  /** Fires with the next value — the new value is the first argument. */
  onValueChange?: (value: number) => void;
  /** Lower bound; the minus button disables there. */
  min?: number;
  /** Upper bound; the plus button disables there. */
  max?: number;
  /** Increment per press. Defaults to `1`. */
  step?: number;
  /** Pill height. Defaults to `md`. */
  size?: NumberStepperSize;
  /** Text at the start of the pill. */
  label?: string;
  /** Accessibility label of the minus button. Defaults to `Decrease`. */
  decrementLabel?: string;
  /** Accessibility label of the plus button. Defaults to `Increase`. */
  incrementLabel?: string;
  /** Disables interaction and dims the control. */
  disabled?: boolean;
  /** Colour role of the glyphs. Defaults to `primary`. */
  tone?: Tone;
  /** Binds the value to a field of the enclosing `FormView`. */
  fieldName?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The pill. */
    style?: StyledProp<ViewStyle>;
    /** The minus/plus buttons. */
    styleButton?: StyledProp<ViewStyle>;
    /** A button at its bound. */
    styleButtonDisabled?: StyledProp<ViewStyle>;
    /** The value text. */
    styleValue?: StyledProp<TextStyle>;
    /** The minus/plus glyphs (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The label text. */
    styleLabel?: StyledProp<TextStyle>;
  };
}

const decimalsOf = (step: number) => {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
};

/**
 * A quantity control: a pill with a minus button, the value and a plus
 * button, stepping between `min` and `max`. The value is controlled through
 * `value`/`onValueChange`, kept internally when `value` is omitted, or bound
 * to a form field through `fieldName`.
 *
 * @example
 * ```tsx
 * <NumberStepper label="Qty" min={1} max={10} value={qty} onValueChange={setQty} />
 * ```
 *
 * @public
 */
const NumberStepper = forwardRef<View, PropsWithChildren<NumberStepperProps>>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      step = 1,
      size = 'md',
      label,
      decrementLabel = 'Decrease',
      incrementLabel = 'Increase',
      disabled = false,
      tone = 'primary',
      fieldName,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (step <= 0) {
      throw new Error(`NumberStepper: step (${step}) must be positive`);
    }
    if (min !== undefined && max !== undefined && max < min) {
      throw new Error(
        `NumberStepper: max (${max}) must not be less than min (${min})`,
      );
    }

    const tones = useTones();
    const palette = tones.tone(tone);
    const field = useOptionalFormField<number>(fieldName);
    const initial = defaultValue ?? min ?? 0;
    const [current, setCurrent] = useControllableState<number>({
      value: field.bound ? (field.value ?? initial) : value,
      defaultValue: initial,
      onChange: (next) => {
        field.setValue(next);
        onValueChange?.(next);
      },
    });

    const decimals = decimalsOf(step);
    const adjust = useCallback(
      (direction: 1 | -1) => {
        let next = current + direction * step;
        if (min !== undefined) next = Math.max(min, next);
        if (max !== undefined) next = Math.min(max, next);
        next = Number(next.toFixed(decimals));
        if (next !== current) setCurrent(next);
      },
      [current, decimals, max, min, setCurrent, step],
    );
    const onAccessibilityAction = (event: AccessibilityActionEvent) =>
      adjust(event.nativeEvent.actionName === 'increment' ? 1 : -1);

    const atMin = min !== undefined && current <= min;
    const atMax = max !== undefined && current >= max;
    const spec = CONTROL_SIZES[size];
    const textColor = tones.resolve(Tokens.color.text);
    const glyphColor = useSlotColor(styled?.styleIcon, 'color', palette.main);
    const valueText = current.toFixed(decimals);

    const button = (direction: 1 | -1) => {
      const bounded = direction === 1 ? atMax : atMin;
      return (
        <StyledPressable
          accessibilityRole="button"
          accessibilityLabel={direction === 1 ? incrementLabel : decrementLabel}
          accessibilityState={{ disabled: disabled || bounded }}
          disabled={disabled || bounded}
          onPress={() => adjust(direction)}
          styled={{
            style: [
              defaults.button,
              {
                width: spec.height,
                height: spec.height,
                borderRadius: RADII.pill,
              },
              styled?.styleButton,
              bounded && [
                { opacity: DISABLED_OPACITY },
                styled?.styleButtonDisabled,
              ],
            ],
          }}
        >
          <Glyph
            name={direction === 1 ? 'plus' : 'minus'}
            size={spec.iconSize}
            color={glyphColor}
          />
        </StyledPressable>
      );
    };

    return (
      <StyledView
        ref={ref}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: current, text: valueText }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        accessibilityState={{ disabled }}
        onAccessibilityAction={onAccessibilityAction}
        styled={{
          style: [
            defaults.root,
            {
              height: spec.height,
              borderRadius: RADII.pill,
              backgroundColor: tones.fill,
            },
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {label ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.label}
            style={[defaults.label, { color: textColor }, styled?.styleLabel]}
          >
            {label}
          </Typography>
        ) : null}
        {button(-1)}
        <Typography
          variant={TYPOGRAPHY_PARTS.button}
          style={[defaults.value, { color: textColor }, styled?.styleValue]}
        >
          {valueText}
        </Typography>
        {button(1)}
      </StyledView>
    );
  },
);
NumberStepper.displayName = 'NumberStepper';

export default NumberStepper;
