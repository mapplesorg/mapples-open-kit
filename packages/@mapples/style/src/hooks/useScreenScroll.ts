import { useContext, useSyncExternalStore } from 'react';

import ScreenMotionContext from '../context/ScreenMotionContext';
import { ScreenScrollState } from '../types';
import { SCREEN_SCROLL_REST } from '../utils/screenMotion';

const subscribeNothing = () => () => undefined;
const getRest = () => SCREEN_SCROLL_REST;

/**
 * Where the screen's main scroll view stands: whether the content has left
 * its top edge and which way it last moved. Re-renders the caller only when
 * one of the two changes, never per scroll frame. Pass `false` to read
 * nothing (the hook then never subscribes, and the scroll views are not asked
 * to report on this element's account).
 *
 * Outside a `ScreenMotionProvider` it is always the resting state.
 *
 * @example
 * ```tsx
 * const { scrolled } = useScreenScroll();
 * return <Bar elevated={scrolled} />;
 * ```
 */
const useScreenScroll = (enabled = true): ScreenScrollState => {
  const store = useContext(ScreenMotionContext);
  const active = enabled && store !== null;

  return useSyncExternalStore(
    active ? store.subscribeScroll : subscribeNothing,
    active ? store.getScroll : getRest,
    getRest,
  );
};

export default useScreenScroll;
