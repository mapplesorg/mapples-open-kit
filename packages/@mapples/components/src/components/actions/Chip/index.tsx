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
  DISABLED_OPACITY,
  Icon,
  Tokens,
  Tone,
  useShape,
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
  CONTAINER_PRESS_ROLE,
  Glyph,
  useControllableState,
  useInteractionState,
  useSlotColor,
} from '../../../internal';

import { defaults } from './defaults';
import {
  CHIP_GEOMETRY,
  ChipPresentation,
  ChipSelectedAppearance,
  ChipSize,
  ChipVariant,
} from './types';

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
  /**
   * Draws the check of a selected `filter` chip. Off, a selected filter chip
   * keeps its leading icon and shows selection by colour alone (single-select
   * filter rails). Defaults to `true`.
   */
  showSelectedIcon?: boolean;
  /**
   * How the selected state paints: `tonal` a soft tone container with tone
   * ink text, `filled` the tone's main colour with contrast text. Defaults to
   * `tonal`.
   */
  selectedAppearance?: ChipSelectedAppearance;
  /**
   * Form: `pill` the content-sized outlined pill; `tile` the leading icon in
   * a 56/64 pt circle (`sm`/`md`) above the label — category rails. A tile
   * needs `leadingIconName`, shows selection on the circle and draws no
   * check or close glyph. Defaults to `pill`.
   */
  presentation?: ChipPresentation;
  /** Strikes the label through while disabled (a sold-out option). Defaults to `false`. */
  strikeDisabled?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The pill (the whole column of a tile). */
    style?: StyledProp<ViewStyle>;
    /** The pill while selected. */
    styleSelected?: StyledProp<ViewStyle>;
    /** The pill while disabled. */
    styleDisabled?: StyledProp<ViewStyle>;
    /** The icon circle of a tile. */
    styleCircle?: StyledProp<ViewStyle>;
    /** The icon circle of a tile while selected. */
    styleCircleSelected?: StyledProp<ViewStyle>;
    /** The label text. */
    styleLabel?: StyledProp<TextStyle>;
    /** The label text while selected. */
    styleLabelSelected?: StyledProp<TextStyle>;
    /** The label text while disabled. */
    styleLabelDisabled?: StyledProp<TextStyle>;
    /** The leading glyph (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
  };
}

/**
 * A compact, content-sized pill for a filter, tag or choice. `filter` chips
 * toggle through `selected ↔ onSelectedChange` and show a check while
 * selected (unless `showSelectedIcon` is off); `input` chips add a close
 * glyph. `selectedAppearance="filled"` paints the selection solid, and
 * `presentation="tile"` stacks a large icon circle over the label. Rows of
 * chips belong in `ChipGroup`.
 *
 * @example
 * ```tsx
 * <Chip label="Vegan" variant="filter" selected={vegan} onSelectedChange={setVegan} />
 * <Chip label="Pizza" presentation="tile" leadingIconName="pizza" />
 * ```
 *
 * @public
 */
const Chip: ForwardRefExoticComponent<
  PropsWithChildren<ChipProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<ChipProps>>(
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
      showSelectedIcon = true,
      selectedAppearance = 'tonal',
      presentation = 'pill',
      strikeDisabled = false,
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
    const shape = useShape();
    const palette = tones.tone(tone);
    const isDisabled = !!disabled;
    const geometry = CHIP_GEOMETRY[size];
    const isTile = presentation === 'tile';
    const isFilled = selectedAppearance === 'filled';
    if (isTile && !leadingIconName) {
      throw new Error(
        'Chip: the tile presentation needs leadingIconName (the glyph in its circle)',
      );
    }

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
    // A tile's label sits on the page, never on the fill.
    const selectedLabel = isFilled && !isTile ? palette.contrast : palette.ink;
    const labelColor = useSlotColor(
      isSelected ? styled?.styleLabelSelected : styled?.styleLabel,
      'color',
      isSelected ? selectedLabel : text,
    );
    const tileGlyph = isSelected
      ? isFilled
        ? palette.contrast
        : palette.ink
      : text;
    const glyphColor = useSlotColor(
      styled?.styleIcon,
      'color',
      isTile ? tileGlyph : labelColor,
    );
    const showClose = !isTile && (closable || variant === 'input');
    const selectedFill = isFilled ? palette.main : palette.container;

    const stateLayer =
      interaction.pressed || interaction.hovered ? (
        <StyledView
          pointerEvents="none"
          styled={{
            style: [
              defaults.stateLayer,
              {
                backgroundColor: tones.stateLayer(
                  isTile ? glyphColor : labelColor,
                  interaction.pressed ? 'pressed' : 'hover',
                ),
              },
            ],
          }}
        />
      ) : null;

    const labelNode = label ? (
      <Typography
        variant={geometry.labelVariant}
        numberOfLines={1}
        style={[
          { color: labelColor },
          isTile && { textAlign: 'center' },
          strikeDisabled && isDisabled && defaults.struck,
          styled?.styleLabel,
          isSelected && styled?.styleLabelSelected,
          isDisabled && styled?.styleLabelDisabled,
        ]}
      >
        {label}
      </Typography>
    ) : null;

    return (
      <StyledPressable
        ref={ref}
        // The remove button must not sit inside a `<button>` on the web.
        accessibilityRole={showClose ? CONTAINER_PRESS_ROLE : 'button'}
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
            isTile
              ? defaults.tileRoot
              : [
                  defaults.root,
                  {
                    height: geometry.height,
                    paddingHorizontal: geometry.paddingX,
                    borderRadius: shape.radius.pill,
                    borderWidth: shape.borderWidth(1),
                    borderColor: isSelected
                      ? 'transparent'
                      : tones.outlineStrong,
                    backgroundColor: isSelected ? selectedFill : 'transparent',
                  },
                ],
            styled?.style,
            isSelected && styled?.styleSelected,
            isDisabled && { opacity: DISABLED_OPACITY },
            isDisabled && styled?.styleDisabled,
          ],
        }}
        {...rest}
      >
        {isTile ? (
          <StyledView
            styled={{
              style: [
                defaults.tileCircle,
                {
                  width: geometry.tile,
                  height: geometry.tile,
                  borderRadius: geometry.tile / 2,
                  backgroundColor: isSelected ? selectedFill : tones.fill,
                },
                styled?.styleCircle,
                isSelected && styled?.styleCircleSelected,
              ],
            }}
          >
            {stateLayer}
            <Icon
              iconName={leadingIconName}
              size={geometry.tileGlyph}
              color={glyphColor}
            />
          </StyledView>
        ) : (
          stateLayer
        )}
        {isTile ? null : variant === 'filter' &&
          isSelected &&
          showSelectedIcon ? (
          <Glyph name="check" size={geometry.glyph} color={glyphColor} />
        ) : leadingIconName ? (
          <Icon
            iconName={leadingIconName}
            size={geometry.glyph}
            color={glyphColor}
          />
        ) : null}
        {labelNode}
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
