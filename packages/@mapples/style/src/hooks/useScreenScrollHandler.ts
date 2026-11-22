import { useCallback, useContext, useRef, useSyncExternalStore } from 'react';

import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import ScreenMotionContext from '../context/ScreenMotionContext';
import { nextScreenScroll } from '../utils/screenMotion';

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;
type ScrollHandler = (event: ScrollEvent) => void;

const subscribeNothing = () => () => undefined;
const getFalse = () => false;

/**
 * The `onScroll` a vertical scroll view passes on so the screen's chrome can
 * react to it (see `useScreenScroll`). It reports to the screen's motion
 * store and then calls the scroll view's own `onScroll`.
 *
 * While no element on the screen reads the scroll state, or outside a
 * `ScreenMotionProvider`, or with `enabled` false (a horizontal list), it
 * returns `onScroll` untouched, so a screen nobody watches pays nothing.
 *
 * @param onScroll - The scroll view's own handler, if it has one
 * @param enabled - `false` for a scroll view that should not drive the chrome
 */
const useScreenScrollHandler = (
  onScroll: ScrollHandler | null | undefined,
  enabled = true,
): ScrollHandler | undefined => {
  const store = useContext(ScreenMotionContext);
  const active = enabled && store !== null;
  const watched = useSyncExternalStore(
    active ? store.subscribeScrollWatched : subscribeNothing,
    active ? store.isScrollWatched : getFalse,
    getFalse,
  );
  const lastOffset = useRef(0);

  const report = useCallback<ScrollHandler>(
    (event) => {
      if (store) {
        const { contentOffset, contentSize, layoutMeasurement } =
          event.nativeEvent;
        const offset = contentOffset.y;
        store.setScroll(
          nextScreenScroll(
            store.getScroll(),
            lastOffset.current,
            offset,
            Math.max(0, contentSize.height - layoutMeasurement.height),
          ),
        );
        lastOffset.current = offset;
      }
      onScroll?.(event);
    },
    [onScroll, store],
  );

  return active && watched ? report : (onScroll ?? undefined);
};

export default useScreenScrollHandler;
