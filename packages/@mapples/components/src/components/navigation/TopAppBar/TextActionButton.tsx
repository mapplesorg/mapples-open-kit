import { FC } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  DISABLED_OPACITY,
  TYPOGRAPHY_PARTS,
  useShape,
  useTones,
} from '@mapples/ui';
import { TextStyle, ViewStyle } from 'react-native';

import { useInteractionState } from '../../../internal';

import { defaults } from './defaults';
import { TOP_APP_BAR_BUTTON_SIZE } from './types';

export interface TextActionButtonProps {
  /** The visible text ('Clear queue'). */
  label: string;
  /** Resolved text colour. */
  color: string;
  /** Dims the button and ignores presses. */
  disabled?: boolean;
  /** Author slot for the button box. */
  styled?: StyledProp<ViewStyle>;
  /** Author slot for the text. */
  styledLabel?: StyledProp<TextStyle>;
  onPress?: () => void;
}

/**
 * A 44 pt tall text button with a pressed/hovered state layer — a bar
 * action that reads better as words than as a glyph.
 */
const TextActionButton: FC<TextActionButtonProps> = ({
  label,
  color,
  disabled = false,
  styled,
  styledLabel,
  onPress,
}) => {
  const tones = useTones();
  const shape = useShape();
  const interaction = useInteractionState({}, disabled);
  const radius = Math.min(TOP_APP_BAR_BUTTON_SIZE / 2, shape.radius.pill);

  return (
    <StyledPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      {...interaction.handlers}
      styled={{
        style: [
          defaults.button,
          defaults.textAction,
          { height: TOP_APP_BAR_BUTTON_SIZE, borderRadius: radius },
          styled,
          disabled && { opacity: DISABLED_OPACITY },
        ],
      }}
    >
      {!disabled && (interaction.pressed || interaction.hovered) && (
        <StyledView
          pointerEvents="none"
          styled={{
            style: [
              defaults.stateLayer,
              {
                borderRadius: radius,
                backgroundColor: tones.stateLayer(
                  color,
                  interaction.pressed ? 'pressed' : 'hover',
                ),
              },
            ],
          }}
        />
      )}
      <Typography
        variant={TYPOGRAPHY_PARTS.button}
        numberOfLines={1}
        style={[{ color }, styledLabel]}
      >
        {label}
      </Typography>
    </StyledPressable>
  );
};

export default TextActionButton;
