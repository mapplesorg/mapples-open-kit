import { FC } from 'react';

import { StyledPressable, StyledProp, StyledView } from '@mapples/style';
import { useTones } from '@mapples/ui';
import { ViewStyle } from 'react-native';

import { Glyph, GlyphName, useInteractionState } from '../../../internal';

import { defaults } from './defaults';
import { TOP_APP_BAR_BUTTON_SIZE, TOP_APP_BAR_GLYPH_SIZE } from './types';

export interface GlyphButtonProps {
  /** The structural glyph to draw. */
  name: GlyphName;
  /** Resolved glyph colour. */
  color: string;
  /** Screen-reader label of the icon-only button. */
  accessibilityLabel: string;
  /** Flips the glyph horizontally (directional glyphs under RTL). */
  mirrored?: boolean;
  /** Author slot for the button box. */
  styled?: StyledProp<ViewStyle>;
  onPress?: () => void;
}

/**
 * A 44 pt round button around a structural glyph with a pressed/hovered
 * state layer — the bar's back arrow.
 */
const GlyphButton: FC<GlyphButtonProps> = ({
  name,
  color,
  accessibilityLabel,
  mirrored = false,
  styled,
  onPress,
}) => {
  const tones = useTones();
  const interaction = useInteractionState();

  return (
    <StyledPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      {...interaction.handlers}
      styled={{
        style: [
          defaults.button,
          {
            width: TOP_APP_BAR_BUTTON_SIZE,
            height: TOP_APP_BAR_BUTTON_SIZE,
            borderRadius: TOP_APP_BAR_BUTTON_SIZE / 2,
          },
          styled,
        ],
      }}
    >
      {(interaction.pressed || interaction.hovered) && (
        <StyledView
          pointerEvents="none"
          styled={{
            style: [
              defaults.stateLayer,
              {
                borderRadius: TOP_APP_BAR_BUTTON_SIZE / 2,
                backgroundColor: tones.stateLayer(
                  color,
                  interaction.pressed ? 'pressed' : 'hover',
                ),
              },
            ],
          }}
        />
      )}
      <Glyph
        name={name}
        size={TOP_APP_BAR_GLYPH_SIZE}
        color={color}
        style={mirrored ? defaults.mirrored : undefined}
      />
    </StyledPressable>
  );
};

export default GlyphButton;
