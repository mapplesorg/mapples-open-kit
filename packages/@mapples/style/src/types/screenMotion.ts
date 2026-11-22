/** Where a screen's main scroll view stands, as far as its chrome cares. */
export interface ScreenScrollState {
  /** The content has moved away from its top edge. */
  scrolled: boolean;
  /** The way the content last moved: `down` is towards later content. */
  direction: 'up' | 'down';
}

/**
 * What one screen shares between its scroll views and the elements that
 * react to them (a bar that lifts, a button that hides), and how often the
 * screen has been shown again. An external store, so a scroll never
 * re-renders the screen: only the elements that subscribed.
 */
export interface ScreenMotionStore {
  getScroll: () => ScreenScrollState;
  /** Called by the screen's vertical scroll views; notifies on a change only. */
  setScroll: (next: ScreenScrollState) => void;
  subscribeScroll: (listener: () => void) => () => void;
  /** Whether any element reads the scroll state (scroll views report only then). */
  isScrollWatched: () => boolean;
  subscribeScrollWatched: (listener: () => void) => () => void;
  /** How many times the screen gained focus after the first. */
  getFocusCount: () => number;
  setFocusCount: (count: number) => void;
  subscribeFocusCount: (listener: () => void) => () => void;
}
