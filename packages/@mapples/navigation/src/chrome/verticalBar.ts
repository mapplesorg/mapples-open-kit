import { createContext, useContext } from 'react';

/**
 * The vertical bar of a device that keeps its system controls down one edge
 * instead of across the top and bottom — the iPhone Duo's rail, which holds
 * the camera, the status bar, the toolbar and the tab bar.
 */
export interface VerticalBar {
  /** The edge the bar runs along. */
  edge: 'left' | 'right';
  /** Its width in points: the safe-area inset on that edge. */
  width: number;
  /**
   * Where the app's own controls may start, in points from the top of the
   * screen: below the camera and the status items the system draws first.
   */
  top: number;
  /**
   * Also draw the navigation controls here: the back button moves into the
   * bar and the horizontal header is left out, the way the system lays out
   * its own bars. Set by a host whose header is drawn in JavaScript (the
   * Creator's Play). Leave it off where the stack's header is the platform's
   * (an exported app): iOS moves that one into the bar itself.
   */
  navigation?: boolean;
}

/**
 * The vertical bar of the device the app runs on, or `null` on a device that
 * has none. Consumed via `useVerticalBar`.
 */
const VerticalBarContext = createContext<VerticalBar | null>(null);

/**
 * Tells the navigators below it that the device has a vertical bar. An app
 * derives the value from `useVerticalBarEdgeIOS()` (`expo-status-bar`) and
 * the matching safe-area inset; a preview passes the previewed device's.
 */
export const VerticalBarProvider = VerticalBarContext.Provider;

/** The device's vertical bar, or `null` when it has none. */
export const useVerticalBar = (): VerticalBar | null =>
  useContext(VerticalBarContext);

/** The side of a control centred in the bar, and its distance from the edge. */
export const BAR_CONTROL_SIZE = 44;

/** Where a control centred in the bar sits, as an absolute-position style. */
export const barControlInset = (
  bar: VerticalBar,
): { left: number } | { right: number } => {
  const inset = Math.max(0, (bar.width - BAR_CONTROL_SIZE) / 2);
  return bar.edge === 'left' ? { left: inset } : { right: inset };
};
