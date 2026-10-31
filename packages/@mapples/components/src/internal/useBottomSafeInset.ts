import { useContext } from 'react';

import { Platform } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

/**
 * Bottom padding for a bar on the bottom edge of the screen.
 *
 * `base` is what the bar pads by on its own. It clears the device's real inset
 * on top of that, because Android's inset ranges from a gesture pill to a 48dp
 * button bar drawn over the app. iOS's `base` already is the home indicator's
 * height, so there the two overlap rather than add up.
 *
 * Reads the context rather than `useSafeAreaInsets`, which throws without a
 * `SafeAreaProvider`: a bar rendered outside one keeps its `base` padding.
 */
export const useBottomSafeInset = (base: number): number => {
  const inset = useContext(SafeAreaInsetsContext)?.bottom ?? 0;
  return Platform.OS === 'ios' ? Math.max(base, inset) : base + inset;
};
