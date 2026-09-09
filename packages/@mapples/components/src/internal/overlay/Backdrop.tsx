import { FC } from 'react';

import { StyledProp, useStyled } from '@mapples/style';
import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';

export interface BackdropProps {
  /** 0 → 1 presence progress driving the scrim opacity. */
  progress: Animated.Value;
  /** Resolved scrim colour. */
  color: string;
  /** Author slot for the scrim. */
  styled?: StyledProp<ViewStyle>;
  /** Fires on a tap; omit to make the scrim inert. */
  onPress?: () => void;
  testID?: string;
}

/**
 * The scrim behind an overlay. A plain `Animated.View` (the progress value
 * cannot travel through `styled`); the author slot is resolved with
 * `useStyled` and merged under the animated opacity.
 */
const Backdrop: FC<BackdropProps> = ({
  progress,
  color,
  styled,
  onPress,
  testID,
}) => {
  const resolved = useStyled({ scrim: styled }) as { scrim?: ViewStyle };

  return (
    <Animated.View
      pointerEvents={onPress ? 'auto' : 'none'}
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: color, opacity: progress },
        resolved.scrim,
      ]}
    >
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onPress}
          style={StyleSheet.absoluteFill}
          testID={testID}
        />
      ) : null}
    </Animated.View>
  );
};

export default Backdrop;
