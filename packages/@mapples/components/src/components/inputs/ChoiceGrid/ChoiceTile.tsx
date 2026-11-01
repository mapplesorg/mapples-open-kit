import { FC } from 'react';

import {
  contrastRatio,
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
  TYPOGRAPHY_PARTS,
  useShape,
  useTones,
} from '@mapples/ui';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

import {
  Glyph,
  useInteractionState,
  useSlotColor,
  useSlotSize,
} from '../../../internal';

import { defaults } from './defaults';
import {
  CHOICE_GRID_CHECK_SIZE,
  ChoiceGridMode,
  ChoiceGridOption,
} from './types';

/** Props for {@link ChoiceTile}. */
export interface ChoiceTileProps {
  /** The choice drawn. */
  option: ChoiceGridOption;
  /** How it is drawn. */
  mode: ChoiceGridMode;
  /** Currently chosen. */
  selected: boolean;
  /** Muted and not pressable (the grid or the option is disabled). */
  disabled: boolean;
  /** Not pressable without muting (the `maxSelected` limit is reached). */
  locked: boolean;
  /** Reports as a checkbox (`multiple`) rather than a button. */
  multiple: boolean;
  /** Draws a check on the selected tile. */
  showCheck: boolean;
  /** Tile height; the swatch diameter. */
  tileSize: number;
  /** Colour role of the selection. */
  tone: Tone;
  /** Fires on a tap. */
  onPress: () => void;
  /** Every tile. */
  styleTile?: StyledProp<ViewStyle>;
  /** A selected tile. */
  styleTileSelected?: StyledProp<ViewStyle>;
  /** The label. */
  styleLabel?: StyledProp<TextStyle>;
  /** The glyph (`color`, `width` as its size). */
  styleIcon?: StyledProp<ViewStyle>;
  /** The swatch circle. */
  styleSwatch?: StyledProp<ViewStyle>;
}

/** Room between a swatch and its selection ring. */
const RING_GAP = 3;
const RING_WIDTH = 2;

/**
 * One choice of a {@link ChoiceGrid} — a glyph tile, a colour swatch, a text
 * cell or an icon-over-label tile — with its pressed, selected, sold-out and
 * disabled looks.
 *
 * @internal
 */
const ChoiceTile: FC<ChoiceTileProps> = ({
  option,
  mode,
  selected,
  disabled,
  locked,
  multiple,
  showCheck,
  tileSize,
  tone,
  onPress,
  styleTile,
  styleTileSelected,
  styleLabel,
  styleIcon,
  styleSwatch,
}) => {
  const tones = useTones();
  const shape = useShape();
  const palette = tones.tone(tone);
  const soldOut = !!option.soldOut;
  const blocked = disabled || soldOut || locked;
  const interaction = useInteractionState({}, blocked);
  const active = interaction.pressed || interaction.hovered;

  const text = tones.resolve(Tokens.color.text);
  const muted = tones.placeholder;
  // `icon` and `text` tiles fill with the tone when selected; a `tile`
  // takes the tone's container.
  const solid = selected && (mode === 'icon' || mode === 'text');
  const contentColor = solid
    ? palette.contrast
    : soldOut
      ? muted
      : selected && mode === 'tile'
        ? palette.ink
        : text;
  const iconColor = useSlotColor(styleIcon, 'color', contentColor);
  const iconSize = useSlotSize(
    styleIcon,
    'width',
    mode === 'tile' ? 28 : Math.round(tileSize * 0.45),
  );

  const spoken = (option.label ?? option.value) + (soldOut ? ', sold out' : '');
  const a11y = {
    accessibilityRole: multiple ? ('checkbox' as const) : ('button' as const),
    accessibilityLabel: spoken,
    accessibilityState: multiple
      ? { checked: selected, disabled: blocked }
      : { selected, disabled: blocked },
  };

  const check = (background: string, color: string) =>
    showCheck && selected ? (
      <StyledView
        pointerEvents="none"
        styled={{
          style: [
            defaults.check,
            {
              width: CHOICE_GRID_CHECK_SIZE,
              height: CHOICE_GRID_CHECK_SIZE,
              borderRadius: CHOICE_GRID_CHECK_SIZE / 2,
              backgroundColor: background,
            },
          ],
        }}
      >
        <Glyph name="check" size={CHOICE_GRID_CHECK_SIZE - 4} color={color} />
      </StyledView>
    ) : null;

  if (mode === 'swatch') {
    const fill = tones.resolve(option.color as string);
    const white = tones.resolve(Tokens.color.white);
    const black = tones.resolve(Tokens.color.black);
    const onFill =
      contrastRatio(white, fill) >= contrastRatio(black, fill) ? white : black;
    const ringWidth = shape.emphasisWidth(RING_WIDTH);
    const ring = tileSize + 2 * (RING_GAP + ringWidth);
    return (
      <StyledPressable
        {...a11y}
        disabled={blocked}
        onPress={onPress}
        {...interaction.handlers}
        styled={{
          style: [
            defaults.swatchRing,
            {
              width: ring,
              height: ring,
              borderRadius: ring / 2,
              borderWidth: ringWidth,
              borderColor: selected
                ? palette.ink
                : active
                  ? tones.outlineStrong
                  : 'transparent',
            },
            styleTile,
            selected && styleTileSelected,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
      >
        <StyledView
          styled={{
            style: [
              defaults.tile,
              {
                width: tileSize,
                height: tileSize,
                borderRadius: tileSize / 2,
                backgroundColor: fill,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: tones.outline,
                overflow: 'hidden',
              },
              styleSwatch,
            ],
          }}
        >
          {soldOut ? (
            <StyledView
              pointerEvents="none"
              styled={{
                style: [
                  defaults.strike,
                  { width: tileSize * 1.5, backgroundColor: onFill },
                ],
              }}
            />
          ) : null}
          {showCheck && selected ? (
            <Glyph
              name="check"
              size={Math.round(tileSize * 0.5)}
              color={onFill}
            />
          ) : null}
        </StyledView>
      </StyledPressable>
    );
  }

  const background = solid
    ? palette.main
    : selected
      ? palette.container
      : active
        ? tones.fillStrong
        : mode === 'text'
          ? 'transparent'
          : tones.fill;
  const borderColor = solid
    ? palette.main
    : selected
      ? palette.main
      : mode === 'text'
        ? soldOut
          ? tones.outline
          : tones.outlineStrong
        : 'transparent';

  const label =
    mode === 'icon' ? null : (
      <Typography
        variant={
          mode === 'text' ? TYPOGRAPHY_PARTS.label : TYPOGRAPHY_PARTS.helper
        }
        numberOfLines={mode === 'tile' ? 2 : 1}
        style={[
          defaults.label,
          { color: contentColor },
          soldOut && { textDecorationLine: 'line-through' },
          styleLabel,
        ]}
      >
        {option.label}
      </Typography>
    );

  return (
    <StyledPressable
      {...a11y}
      disabled={blocked}
      onPress={onPress}
      {...interaction.handlers}
      styled={{
        style: [
          defaults.tile,
          mode === 'tile' && defaults.tileStacked,
          {
            minHeight: tileSize,
            borderRadius:
              mode === 'text' ? shape.control.md.radius : shape.radius.md,
            backgroundColor: background,
            borderWidth: shape.borderWidth(mode === 'text' ? 1 : 2),
            borderColor,
          },
          mode === 'text' && soldOut && { borderStyle: 'dashed' as const },
          styleTile,
          selected && styleTileSelected,
          disabled && { opacity: DISABLED_OPACITY },
        ],
      }}
    >
      {mode !== 'text' && option.iconName ? (
        <Icon iconName={option.iconName} size={iconSize} color={iconColor} />
      ) : null}
      {label}
      {solid
        ? check(palette.contrast, palette.main)
        : check(palette.main, palette.contrast)}
    </StyledPressable>
  );
};

export default ChoiceTile;
