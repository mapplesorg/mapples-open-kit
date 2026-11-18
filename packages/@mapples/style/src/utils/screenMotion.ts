import { ScreenMotionStore, ScreenScrollState } from '../types';

/** A screen that has not scrolled: at the top, nothing to hide. */
export const SCREEN_SCROLL_REST: ScreenScrollState = {
  scrolled: false,
  direction: 'up',
};

/** Content offset, in points, past which a screen counts as scrolled. */
export const SCREEN_SCROLLED_OFFSET = 4;

/** Travel, in points, before a change of scroll direction counts. */
export const SCREEN_SCROLL_DIRECTION_SLOP = 8;

const createListeners = () => {
  const listeners = new Set<() => void>();
  return {
    size: () => listeners.size,
    notify: () => listeners.forEach((listener) => listener()),
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

/**
 * The store behind `ScreenMotionProvider`: one per screen.
 */
export const createScreenMotionStore = (): ScreenMotionStore => {
  let scroll = SCREEN_SCROLL_REST;
  let focusCount = 0;
  const scrollListeners = createListeners();
  const watchedListeners = createListeners();
  const focusListeners = createListeners();

  return {
    getScroll: () => scroll,
    setScroll: (next) => {
      if (
        next.scrolled === scroll.scrolled &&
        next.direction === scroll.direction
      ) {
        return;
      }
      scroll = next;
      scrollListeners.notify();
    },
    subscribeScroll: (listener) => {
      const wasWatched = scrollListeners.size() > 0;
      const unsubscribe = scrollListeners.subscribe(listener);
      if (!wasWatched) watchedListeners.notify();
      return () => {
        unsubscribe();
        if (scrollListeners.size() === 0) watchedListeners.notify();
      };
    },
    isScrollWatched: () => scrollListeners.size() > 0,
    subscribeScrollWatched: watchedListeners.subscribe,
    getFocusCount: () => focusCount,
    setFocusCount: (count) => {
      if (count === focusCount) return;
      focusCount = count;
      focusListeners.notify();
    },
    subscribeFocusCount: focusListeners.subscribe,
  };
};

/**
 * The scroll state after the content moved to `offset`, given the state and
 * offset before. Overscroll at either end (`offset` below 0 or past
 * `maxOffset`) never flips the direction, so a bounce does not make a
 * hidden bar flicker.
 */
export const nextScreenScroll = (
  previous: ScreenScrollState,
  previousOffset: number,
  offset: number,
  maxOffset: number,
): ScreenScrollState => {
  const scrolled = offset > SCREEN_SCROLLED_OFFSET;
  if (!scrolled) return SCREEN_SCROLL_REST;
  if (offset > maxOffset) return { scrolled, direction: previous.direction };

  const travel = offset - previousOffset;
  if (Math.abs(travel) < SCREEN_SCROLL_DIRECTION_SLOP) {
    return { scrolled, direction: previous.direction };
  }
  return { scrolled, direction: travel > 0 ? 'down' : 'up' };
};
