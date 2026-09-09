import { forwardRef, PropsWithChildren } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  DISABLED_OPACITY,
  Icon,
  RADII,
  Tokens,
  Tone,
  useTones,
} from '@mapples/ui';
import {
  Pressable,
  PressableProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import {
  Glyph,
  useControllableState,
  useInteractionState,
  useSlotColor,
} from '../../../internal';

import { defaults } from './defaults';
import { CHIP_GEOMETRY, ChipSize, ChipVariant } from './types';

/** Props for {@link Chip}. */
export interface ChipProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Visible text. */
  label?: string;
  /** Role of the chip. Defaults to `assist`. */
  variant?: ChipVariant;
  /** Selected state (controlled). Omit to let the chip keep its own state. */
  selected?: boolean;
  /** Initial state while uncontrolled. Defaults to `false`. */
  defaultSelected?: boolean;
  /** Fires with the next selected state after a press. */
  onSelectedChange?: (selected: boolean) => void;
  /** Glyph before the label (project icon family). */
  leadingIconName?: string;
  /** Shows a close glyph that fires `onClose`. */
  closable?: boolean;
  /** Fires when the close glyph is pressed. */
  onClose?: () => void;
  /** Height. Defaults to `md`. */
  size?: ChipSize;
  /** Colour role of the selected state. Defaults to `primary`. */
  tone?: Tone;
  /** Styled slots for every visual part. */
  styled?: {
    /** The pill. */
    style?: StyledProp<ViewStyle>;
    /** The pill while selected. */
    styleSelected?: StyledProp<ViewStyle>;
    /** The label text. */
    styleLabel?: StyledProp<TextStyle>;
    /** The label text while selected. */
    styleLabelSelected?: StyledProp<TextStyle>;
    /** The leading glyph (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
  };
}

/**
 * A compact, content-sized pill for a filter, tag or choice. `filter` chips
 * toggle through `selected ↔ onSelectedChange` and show a check while
 * selected; `input` chips add a close glyph. Rows of chips belong in
 * `ChipGroup`.
 *
 * @example
 * ```tsx
 * <Chip label="Vegan" variant="filter" selected={vegan} onSelectedChange={setVegan} />
 * ```
 *
 * @public
 */
const Chip = forwardRef<View, PropsWithChildren<ChipProps>>(
  (
    {
      label,
      variant = 'assist',
      selected,
      defaultSelected = false,
      onSelectedChange,
      leadingIconName,
      closable = false,
      onClose,
      size = 'md',
      tone = 'primary',
      disabled,
      onPress,
      onPressIn,
      onPressOut,
      onHoverIn,
      onHoverOut,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const palette = tones.tone(tone);
    const isDisabled = !!disabled;
    const geometry = CHIP_GEOMETRY[size];

    const [isSelected, setSelected] = useControllableState<boolean>({
      value: selected,
      defaultValue: defaultSelected,
      onChange: onSelectedChange,
    });
    const toggles =
      variant === 'filter' || selected !== undefined || !!onSelectedChange;

    const interaction = useInteractionState(
      { onPressIn, onPressOut, onHoverIn, onHoverOut },
      isDisabled,
    );

    const text = tones.resolve(Tokens.color.text);
    const labelColor = useSlotColor(
      isSelected ? styled?.styleLabelSelected : styled?.styleLabel,
      'color',
      isSelected ? palette.main : text,
    );
    const glyphColor = useSlotColor(styled?.styleIcon, 'color', labelColor);
    const showClose = closable || variant === 'input';

    return (
      <StyledPressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{
          disabled: isDisabled,
          selected: toggles ? isSelected : undefined,
        }}
        disabled={isDisabled}
        onPress={(event) => {
          if (toggles) setSelected(!isSelected);
          onPress?.(event);
        }}
        {...interaction.handlers}
        styled={{
          style: [
            defaults.root,
            {
              height: geometry.height,
              paddingHorizontal: geometry.paddingX,
              borderRadius: RADII.pill,
              borderColor: isSelected ? 'transparent' : tones.outlineStrong,
              backgroundColor: isSelected ? palette.container : 'transparent',
            },
            styled?.style,
            isSelected && styled?.styleSelected,
            isDisabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {(interaction.pressed || interaction.hovered) && (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                defaults.stateLayer,
                {
                  backgroundColor: tones.stateLayer(
                    labelColor,
                    interaction.pressed ? 'pressed' : 'hover',
                  ),
                },
              ],
            }}
          />
        )}
        {variant === 'filter' && isSelected ? (
          <Glyph name="check" size={geometry.glyph} color={glyphColor} />
        ) : leadingIconName ? (
          <Icon
            iconName={leadingIconName}
            size={geometry.glyph}
            color={glyphColor}
          />
        ) : null}
        {!!label && (
          <Typography
            variant={geometry.labelVariant}
            numberOfLines={1}
            style={[
              { color: labelColor },
              styled?.styleLabel,
              isSelected && styled?.styleLabelSelected,
            ]}
          >
            {label}
          </Typography>
        )}
        {showClose ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove"
            disabled={isDisabled}
            hitSlop={8}
            onPress={onClose}
            style={defaults.close}
          >
            <Glyph name="close" size={geometry.glyph} color={labelColor} />
          </Pressable>
        ) : null}
      </StyledPressable>
    );
  },
);
Chip.displayName = 'Chip';

export default Chip;
