import { FC, forwardRef, PropsWithChildren } from 'react';

import { StyledProp, StyledView, Typography, useStyled } from '@mapples/style';
import {
  DISABLED_OPACITY,
  Tokens,
  Tone,
  TonePalette,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import {
  Animated,
  Pressable,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import {
  DURATION,
  Option,
  readOptions,
  useControllableState,
  useOptionalFormField,
  useSlotColor,
  useTimingValue,
} from '../../../internal';

import { defaults } from './defaults';
import { RADIO_DIAMETER, RadioGroupDirection, RadioGroupSize } from './types';

/** Props for {@link RadioGroup}. */
export interface RadioGroupProps extends Omit<ViewProps, 'children'> {
  /** The choices: `[{label, value, description?, disabled?}]`. */
  options?: Option[];
  /** Selected value (controlled). Omit to let the group keep its own state. */
  value?: string;
  /** Initial value while uncontrolled; `''` selects nothing. */
  defaultValue?: string;
  /** Fires with the chosen value — the new value is the first argument. */
  onValueChange?: (value: string) => void;
  /** Stacks the rows or lays them out in a wrapping row. Defaults to `column`. */
  direction?: RadioGroupDirection;
  /** Radio diameter: `sm` 18, `md` 20, `lg` 24. Defaults to `md`. */
  size?: RadioGroupSize;
  /** Colour role of the selected radio. Defaults to `primary`. */
  tone?: Tone;
  /** Disables interaction and dims the group. */
  disabled?: boolean;
  /** Binds the value to a field of the enclosing `FormView`. */
  fieldName?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The group. */
    style?: StyledProp<ViewStyle>;
    /** One row (radio + texts). */
    styleItem?: StyledProp<ViewStyle>;
    /** The outer circle. */
    styleRadio?: StyledProp<ViewStyle>;
    /** The outer circle while selected. */
    styleRadioSelected?: StyledProp<ViewStyle>;
    /** The inner dot (its `backgroundColor` is the dot colour). */
    styleDot?: StyledProp<ViewStyle>;
    /** The label text. */
    styleLabel?: StyledProp<TextStyle>;
    /** The description text. */
    styleDescription?: StyledProp<TextStyle>;
  };
}

interface RadioItemProps {
  option: Option;
  selected: boolean;
  disabled: boolean;
  diameter: number;
  palette: TonePalette;
  outline: string;
  text: string;
  secondary: string;
  styled: RadioGroupProps['styled'];
  onSelect: (value: string) => void;
}

const RadioItem: FC<RadioItemProps> = ({
  option,
  selected,
  disabled,
  diameter,
  palette,
  outline,
  text,
  secondary,
  styled,
  onSelect,
}) => {
  const progress = useTimingValue(selected ? 1 : 0, {
    duration: DURATION.fast,
  });
  const dotColor = useSlotColor(
    styled?.styleDot,
    'backgroundColor',
    palette.main,
  );
  const resolved = useStyled({ dot: styled?.styleDot }) as { dot?: ViewStyle };
  const dot = diameter / 2;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={option.label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onSelect(option.value)}
    >
      <StyledView
        styled={{
          style: [
            defaults.item,
            styled?.styleItem,
            option.disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
      >
        <StyledView
          styled={{
            style: [
              defaults.radio,
              {
                width: diameter,
                height: diameter,
                borderRadius: diameter / 2,
                borderColor: selected ? palette.main : outline,
              },
              styled?.styleRadio,
              selected && styled?.styleRadioSelected,
            ],
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              resolved.dot,
              {
                width: dot,
                height: dot,
                borderRadius: dot / 2,
                backgroundColor: dotColor,
                opacity: progress,
                transform: [
                  {
                    scale: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        </StyledView>
        <StyledView styled={{ style: defaults.labels }}>
          <Typography
            variant={TYPOGRAPHY_PARTS.body}
            style={[{ color: text }, styled?.styleLabel]}
          >
            {option.label}
          </Typography>
          {option.description ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.helper}
              style={[{ color: secondary }, styled?.styleDescription]}
            >
              {option.description}
            </Typography>
          ) : null}
        </StyledView>
      </StyledView>
    </Pressable>
  );
};

/**
 * An exclusive choice among a few visible options, each a radio with a
 * label and optional description. The value is controlled through
 * `value`/`onValueChange`, kept internally when `value` is omitted, or bound
 * to a form field through `fieldName`.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   options={[
 *     { label: 'Standard', value: 'standard', description: '3–5 days' },
 *     { label: 'Express', value: 'express', description: 'Next day' },
 *   ]}
 *   value={shipping}
 *   onValueChange={setShipping}
 * />
 * ```
 *
 * @public
 */
const RadioGroup = forwardRef<View, PropsWithChildren<RadioGroupProps>>(
  (
    {
      options,
      value,
      defaultValue = '',
      onValueChange,
      direction = 'column',
      size = 'md',
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
    const tones = useTones();
    const palette = tones.tone(tone);
    const items = readOptions(options, 'RadioGroup');
    const field = useOptionalFormField<string>(fieldName);
    const [current, setCurrent] = useControllableState<string>({
      value: field.bound ? (field.value ?? '') : value,
      defaultValue,
      onChange: (next) => {
        field.setValue(next);
        field.touch();
        onValueChange?.(next);
      },
    });

    const text = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);

    return (
      <StyledView
        ref={ref}
        accessibilityRole="radiogroup"
        accessibilityState={{ disabled }}
        styled={{
          style: [
            defaults.root,
            direction === 'row' && defaults.row,
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {items.map((option) => (
          <RadioItem
            key={option.value}
            option={option}
            selected={option.value === current}
            disabled={disabled || !!option.disabled}
            diameter={RADIO_DIAMETER[size]}
            palette={palette}
            outline={tones.outlineStrong}
            text={text}
            secondary={secondary}
            styled={styled}
            onSelect={setCurrent}
          />
        ))}
      </StyledView>
    );
  },
);
RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
