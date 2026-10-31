import { Platform } from 'react-native';

/** Main axis of a BottomActionBar. */
export const BOTTOM_ACTION_BAR_DIRECTIONS = ['row', 'column'] as const;
export type BottomActionBarDirection =
  (typeof BOTTOM_ACTION_BAR_DIRECTIONS)[number];

/** Least bottom padding with `safeArea`: the home indicator on iOS, the bar's own padding elsewhere. */
export const BOTTOM_ACTION_BAR_SAFE_INSET: number = Platform.select({
  ios: 34,
  default: 16,
});
