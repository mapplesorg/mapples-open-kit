import {
  FC,
  Fragment,
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography, useStyled } from '@mapples/style';
import {
  DISABLED_OPACITY,
  Tokens,
  Tone,
  TonePalette,
  TYPOGRAPHY_PARTS,
  useShape,
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
import {
  RADIO_DIAMETER,
  RadioGroupDirection,
  RadioGroupSize,
  RadioGroupVariant,
} from './types';

/** Props for {@link RadioGroup}. */
export interface RadioGroupProps extends Omit<ViewProps, 'children'> {
  /** The choices: `[{label, value, description?, meta?, disabled?}]`; `meta` is a trailing detail such as a price ('+€2.00'). */
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
  /** Plain rows (`list`) or a bordered card per option (`card`); cards stretch to the width. Defaults to `list`. */
  variant?: RadioGroupVariant;
  /** Draws a divider between the options. Needs the `list` variant and the `column` direction. */
  dividers?: boolean;
  /** Colour role of the selected radio (and the selected card's border). Defaults to `primary`. */
  tone?: Tone;
  /** Disables interaction and dims the group. */
  disabled?: boolean;
  /** Binds the value to a field of the enclosing `FormView`. */
  fieldName?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The group. */
    style?: StyledProp<ViewStyle>;
    /** One row (radio + texts); the card in the `card` variant. */
    styleItem?: StyledProp<ViewStyle>;
    /** The selected row or card (e.g. a 2 pt tone border). */
    styleItemSelected?: StyledProp<ViewStyle>;
    /** The outer circle (its `borderRadius` squares it). */
    styleRadio?: StyledProp<ViewStyle>;
    /** The outer circle while selected. */
    styleRadioSelected?: StyledProp<ViewStyle>;
    /** The inner dot (its `backgroundColor` is the dot colour; its `borderRadius` squares it). */
    styleDot?: StyledProp<ViewStyle>;
    /** The label text. */
    styleLabel?: StyledProp<TextStyle>;
    /** The description text. */
    styleDescription?: StyledProp<TextStyle>;
    /** The trailing meta text of an option. */
    styleMeta?: StyledProp<TextStyle>;
    /** The divider between options. */
    styleDivider?: StyledProp<ViewStyle>;
  };
}

interface RadioItemProps {
  option: Option;
  selected: boolean;
  disabled: boolean;
  diameter: number;
  card: boolean;
  cardRadius: number;
  cardOutline: string;
  /** Outline width of the `card` surface. */
  cardBorderWidth: number;
  surface: string;
  palette: TonePalette;
  outline: string;
  /** Outline width of the radio ring. */
  ringWidth: number;
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
  card,
  cardRadius,
  cardOutline,
  cardBorderWidth,
  surface,
  palette,
  outline,
  ringWidth,
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
    palette.ink,
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
            card && [
              defaults.card,
              {
                borderRadius: cardRadius,
                borderWidth: cardBorderWidth,
                borderColor: selected ? palette.ink : cardOutline,
                backgroundColor: surface,
              },
            ],
            styled?.styleItem,
            selected && styled?.styleItemSelected,
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
                borderWidth: ringWidth,
                borderColor: selected ? palette.ink : outline,
              },
              styled?.styleRadio,
              selected && styled?.styleRadioSelected,
            ],
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              { width: dot, height: dot, borderRadius: dot / 2 },
              // After the geometry, so a slot `borderRadius` squares the dot.
              resolved.dot,
              {
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
        <StyledView
          styled={{
            style: [defaults.labels, !!option.meta && defaults.labelsGrow],
          }}
        >
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
        {option.meta ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.body}
            style={[{ color: secondary }, styled?.styleMeta]}
          >
            {option.meta}
          </Typography>
        ) : null}
      </StyledView>
    </Pressable>
  );
};

/**
 * An exclusive choice among a few visible options, each a radio with a
 * label, an optional description and a trailing meta (a price), as plain
 * rows (optionally divided) or a bordered card per option. The value is
 * controlled through `value`/`onValueChange`, kept internally when `value`
 * is omitted, or bound to a form field through `fieldName`.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   variant="card"
 *   options={[
 *     { label: 'Standard', value: 'standard', description: '3–5 days', meta: 'Free' },
 *     { label: 'Express', value: 'express', description: 'Next day', meta: '+€9.00' },
 *   ]}
 *   value={shipping}
 *   onValueChange={setShipping}
 * />
 * ```
 *
 * @public
 */
const RadioGroup: ForwardRefExoticComponent<
  PropsWithChildren<RadioGroupProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<RadioGroupProps>>(
  (
    {
      options,
      value,
      defaultValue = '',
      onValueChange,
      direction = 'column',
      size = 'md',
      variant = 'list',
      dividers = false,
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
    if (dividers && variant === 'card') {
      throw new Error(
        'RadioGroup: dividers apply to the list variant, not to cards',
      );
    }
    if (dividers && direction === 'row') {
      throw new Error('RadioGroup: dividers need the column direction');
    }

    const tones = useTones();
    const shape = useShape();
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
    const surface = tones.resolve(Tokens.color.surface);
    const card = variant === 'card';
    // Cards and trailing metas lay out across the available width.
    const stretch = card || items.some((option) => !!option.meta);

    return (
      <StyledView
        ref={ref}
        accessibilityRole="radiogroup"
        accessibilityState={{ disabled }}
        styled={{
          style: [
            defaults.root,
            direction === 'row' && defaults.row,
            stretch && { alignSelf: 'stretch' },
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {items.map((option, index) => (
          <Fragment key={option.value}>
            {dividers && index > 0 ? (
              <StyledView
                styled={{
                  style: [
                    defaults.divider,
                    { backgroundColor: tones.divider },
                    styled?.styleDivider,
                  ],
                }}
              />
            ) : null}
            <RadioItem
              option={option}
              selected={option.value === current}
              disabled={disabled || !!option.disabled}
              diameter={RADIO_DIAMETER[size]}
              card={card}
              cardRadius={shape.radius.md}
              cardOutline={tones.outline}
              cardBorderWidth={shape.borderWidth(1)}
              surface={surface}
              palette={palette}
              outline={tones.outlineStrong}
              ringWidth={shape.borderWidth(2)}
              text={text}
              secondary={secondary}
              styled={styled}
              onSelect={setCurrent}
            />
          </Fragment>
        ))}
      </StyledView>
    );
  },
);
RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
