import { FC } from 'react';

import { StyledPressable, StyledProp, StyledView } from '@mapples/style';
import { useTones } from '@mapples/ui';
import { ImageProps } from 'expo-image';
import { ViewStyle } from 'react-native';

import { useInteractionState } from '../../../internal';
import Avatar from '../../content/Avatar';

import { defaults } from './defaults';
import { TOP_APP_BAR_AVATAR_SIZE, TOP_APP_BAR_BUTTON_SIZE } from './types';

export interface AvatarButtonProps {
  /** Display name; its initials show without a photo. */
  name?: string;
  /** Photo source. */
  source?: ImageProps['source'];
  /** Screen-reader label of the button. */
  accessibilityLabel: string;
  /** Resolved colour of the pressed/hovered state layer. */
  color: string;
  /** Author slot for the avatar box. */
  styled?: StyledProp<ViewStyle>;
  /** Fires when pressed; unset, the avatar is decorative. */
  onPress?: () => void;
}

/**
 * The bar's trailing account avatar centred in a 44 pt touch target, with a
 * pressed/hovered state layer when it is pressable.
 */
const AvatarButton: FC<AvatarButtonProps> = ({
  name,
  source,
  accessibilityLabel,
  color,
  styled,
  onPress,
}) => {
  const tones = useTones();
  const interaction = useInteractionState();
  const box = {
    width: TOP_APP_BAR_BUTTON_SIZE,
    height: TOP_APP_BAR_BUTTON_SIZE,
    borderRadius: TOP_APP_BAR_BUTTON_SIZE / 2,
  };
  const avatar = (
    <Avatar
      name={name}
      source={source}
      size={TOP_APP_BAR_AVATAR_SIZE}
      styled={{ style: styled }}
    />
  );

  if (!onPress) {
    return (
      <StyledView
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        styled={{ style: [defaults.button, box] }}
      >
        {avatar}
      </StyledView>
    );
  }

  return (
    <StyledPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      {...interaction.handlers}
      styled={{ style: [defaults.button, box] }}
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
      {avatar}
    </StyledPressable>
  );
};

export default AvatarButton;
