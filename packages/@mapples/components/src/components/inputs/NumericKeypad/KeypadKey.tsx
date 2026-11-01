import { FC, ReactNode } from 'react';

import { StyledPressable, StyledProp, StyledView } from '@mapples/style';
import { ViewStyle } from 'react-native';

import { useInteractionState } from '../../../internal';

import { defaults } from './defaults';

/** Props for {@link KeypadKey}. */
export interface KeypadKeyProps {
  /** Spoken name of the key. */
  accessibilityLabel: string;
  /** Fires on a tap. */
  onPress: () => void;
  /** Blocks presses. */
  disabled: boolean;
  /** A round key of `size` diameter, else a key stretched across its cell. */
  round: boolean;
  /** Key height (and width when round). */
  size: number;
  /** Corner radius of a stretched key. */
  radius: number;
  /** Resting fill (`transparent` for a plain key). */
  fill: string;
  /** Fill while pressed. */
  pressedFill: string;
  /** Fill while hovered (web). */
  hoverFill: string;
  /** Label / glyph colour at rest. */
  color: string;
  /** Label / glyph colour while pressed. */
  pressedColor: string;
  /** Draws the key's content in the colour of its current state. */
  renderContent: (color: string) => ReactNode;
  /** The key's own slots. */
  styleKey?: StyledProp<ViewStyle>;
  /** The key while pressed. */
  styleKeyPressed?: StyledProp<ViewStyle>;
}

/**
 * One cell of the keypad with its pressable key; tracks its own pressed and
 * hovered state.
 *
 * @internal
 */
const KeypadKey: FC<KeypadKeyProps> = ({
  accessibilityLabel,
  onPress,
  disabled,
  round,
  size,
  radius,
  fill,
  pressedFill,
  hoverFill,
  color,
  pressedColor,
  renderContent,
  styleKey,
  styleKeyPressed,
}) => {
  const interaction = useInteractionState({}, disabled);
  const pressed = interaction.pressed;

  return (
    <StyledView styled={{ style: defaults.cell }}>
      <StyledPressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        {...interaction.handlers}
        styled={{
          style: [
            defaults.key,
            !round && defaults.keyStretch,
            round
              ? { width: size, height: size, borderRadius: size / 2 }
              : { height: size, borderRadius: radius },
            {
              backgroundColor: pressed
                ? pressedFill
                : interaction.hovered
                  ? hoverFill
                  : fill,
            },
            styleKey,
            pressed && styleKeyPressed,
          ],
        }}
      >
        {renderContent(pressed ? pressedColor : color)}
      </StyledPressable>
    </StyledView>
  );
};

export default KeypadKey;
