import { FC } from 'react';

import { Pressable, StyleSheet, View } from 'react-native';

import { BAR_CONTROL_SIZE, barControlInset, VerticalBar } from './verticalBar';

export interface RailBackButtonProps {
  /** The device's vertical bar the button is drawn in. */
  bar: VerticalBar;
  onPress: () => void;
  /** Glyph colour; the header's tint where the navigator sets one. */
  color?: string;
}

/**
 * The back button of a stack screen on a device with a vertical bar: at the
 * top of that bar, under the status items, where the system puts primary
 * navigation on iPhone Duo. Drawn over the screen's own area, outside the
 * page, which the safe area already keeps clear of the bar.
 */
const RailBackButton: FC<RailBackButtonProps> = ({
  bar,
  onPress,
  color = '#000000',
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel="Back"
    style={[styles.button, barControlInset(bar), { top: bar.top }]}
    testID="rail-back-button"
  >
    <View style={[styles.chevron, { borderColor: color }]} />
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: BAR_CONTROL_SIZE,
    height: BAR_CONTROL_SIZE,
    borderRadius: BAR_CONTROL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
  },
  // A chevron from two borders of a rotated square, nudged to look centred.
  chevron: {
    width: 10,
    height: 10,
    marginLeft: 4,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
});

export default RailBackButton;
