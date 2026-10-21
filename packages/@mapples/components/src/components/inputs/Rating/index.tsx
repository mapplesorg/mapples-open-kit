import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView } from '@mapples/style';
import { DISABLED_OPACITY, Tone, useTones } from '@mapples/ui';
import {
  AccessibilityActionEvent,
  GestureResponderEvent,
  I18nManager,
  Pressable,
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
import { RATING_STAR, RatingSize } from './types';

/** Props for {@link Rating}. */
export interface RatingProps extends Omit<ViewProps, 'children'> {
  /** Current rating (controlled). Omit to let the control keep its own state. */
  value?: number;
  /** Initial rating while uncontrolled. Defaults to `0`. */
  defaultValue?: number;
  /** Fires with the next rating — the new value is the first argument. */
  onValueChange?: (value: number) => void;
  /** Number of stars. Defaults to `5`. */
  max?: number;
  /** Lets a press on the leading half of a star set a half value. Defaults to `false`. */
  allowHalf?: boolean;
  /** Displays the rating without accepting presses. Defaults to `false`. */
  readOnly?: boolean;
  /** Star edge: `sm` 16, `md` 24, `lg` 32. Defaults to `md`. */
  size?: RatingSize;
  /** Colour role of the filled stars. Defaults to `accent`. */
  tone?: Tone;
  /** Disables interaction and dims the stars. */
  disabled?: boolean;
  /** Binds the rating to a field of the enclosing `FormView`. */
  fieldName?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row of stars. */
    style?: StyledProp<ViewStyle>;
    /** The filled part of a star (`color`). */
    styleStar?: StyledProp<ViewStyle & { color?: string }>;
    /** The empty star outline (`color`). */
    styleStarEmpty?: StyledProp<ViewStyle & { color?: string }>;
  };
}

/**
 * A row of stars that shows a rating or lets the person set one. Filled
 * stars paint in the tone colour over the outline; with `allowHalf` a press
 * on the leading half of a star sets a half value. `readOnly` turns the
 * control into a plain display announced as an image.
 *
 * @example
 * ```tsx
 * <Rating value={score} onValueChange={setScore} allowHalf />
 * <Rating value={4.5} allowHalf readOnly size="sm" />
 * ```
 *
 * @public
 */
const Rating: ForwardRefExoticComponent<
  PropsWithChildren<RatingProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<RatingProps>>(
  (
    {
      value,
      defaultValue = 0,
      onValueChange,
      max = 5,
      allowHalf = false,
      readOnly = false,
      size = 'md',
      tone = 'accent',
      disabled = false,
      fieldName,
      accessibilityLabel,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (!Number.isInteger(max) || max < 1) {
      throw new Error(`Rating: max (${max}) must be a positive integer`);
    }

    const tones = useTones();
    const palette = tones.tone(tone);
    const field = useOptionalFormField<number>(fieldName);
    const [current, setCurrent] = useControllableState<number>({
      value: field.bound ? (field.value ?? 0) : value,
      defaultValue,
      onChange: (next) => {
        field.setValue(next);
        field.touch();
        onValueChange?.(next);
      },
    });

    const star = RATING_STAR[size];
    const increment = allowHalf ? 0.5 : 1;
    const interactive = !readOnly && !disabled;
    const fillColor = useSlotColor(styled?.styleStar, 'color', palette.main);
    const emptyColor = useSlotColor(
      styled?.styleStarEmpty,
      'color',
      tones.outlineStrong,
    );

    const press = useCallback(
      (index: number, event: GestureResponderEvent) => {
        const x = event.nativeEvent.locationX;
        const leadingHalf = I18nManager.isRTL ? x > star / 2 : x < star / 2;
        setCurrent(index + (allowHalf && leadingHalf ? 0.5 : 1));
      },
      [allowHalf, setCurrent, star],
    );
    const onAccessibilityAction = (event: AccessibilityActionEvent) => {
      const direction = event.nativeEvent.actionName === 'increment' ? 1 : -1;
      setCurrent(Math.min(max, Math.max(0, current + direction * increment)));
    };

    const valueText = String(current);
    const label = accessibilityLabel ?? `${valueText} of ${max} stars`;

    return (
      <StyledView
        ref={ref}
        accessibilityRole={readOnly ? 'image' : 'adjustable'}
        accessibilityLabel={label}
        accessibilityValue={
          readOnly ? undefined : { min: 0, max, now: current, text: valueText }
        }
        accessibilityActions={
          readOnly ? undefined : [{ name: 'increment' }, { name: 'decrement' }]
        }
        accessibilityState={{ disabled }}
        onAccessibilityAction={readOnly ? undefined : onAccessibilityAction}
        styled={{
          style: [
            defaults.root,
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {Array.from({ length: max }, (_, index) => {
          const remainder = Math.min(1, Math.max(0, current - index));
          const fraction = allowHalf
            ? remainder >= 1
              ? 1
              : remainder >= 0.5
                ? 0.5
                : 0
            : remainder >= 0.5
              ? 1
              : 0;
          const glyphs = (
            <StyledView
              styled={{
                style: [
                  defaults.star,
                  { width: star, height: star },
                  styled?.styleStarEmpty,
                ],
              }}
            >
              <Glyph name="starOutline" size={star} color={emptyColor} />
              {fraction > 0 ? (
                <StyledView
                  pointerEvents="none"
                  styled={{
                    style: [
                      defaults.fill,
                      { width: star * fraction },
                      styled?.styleStar,
                    ],
                  }}
                >
                  <Glyph name="star" size={star} color={fillColor} />
                </StyledView>
              ) : null}
            </StyledView>
          );
          return interactive ? (
            <Pressable
              key={index}
              accessible={false}
              focusable={false}
              hitSlop={{
                top: Math.max(0, (44 - star) / 2),
                bottom: Math.max(0, (44 - star) / 2),
                left: 1,
                right: 1,
              }}
              onPress={(event) => press(index, event)}
            >
              {glyphs}
            </Pressable>
          ) : (
            <View key={index}>{glyphs}</View>
          );
        })}
      </StyledView>
    );
  },
);
Rating.displayName = 'Rating';

export default Rating;
