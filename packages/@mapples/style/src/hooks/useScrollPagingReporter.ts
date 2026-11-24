import { useCallback, useEffect, useRef } from 'react';

import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

import {
  clearScrollPaging,
  scrollPagingOf,
  setScrollPaging,
  subscribeScrollPageRequests,
} from '../utils/scrollPaging';

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

export interface ScrollPagingHandlers {
  onScroll?: ((event: ScrollEvent) => void) | null;
  onLayout?: ((event: LayoutChangeEvent) => void) | null;
  onContentSizeChange?: ((width: number, height: number) => void) | null;
}

/**
 * The handlers a paging scroll view passes on so elements elsewhere on the
 * screen can follow its page (see `useScrollPaging`) and ask it for one
 * (`requestScrollPage`). Each handler reports and then calls the scroll
 * view's own. Without a `name` the handlers come back untouched.
 *
 * @param name - What the scroll view is called; `undefined` reports nothing
 * @param horizontal - The scroll axis
 * @param handlers - The scroll view's own handlers
 * @param scrollToOffset - Scrolls the view to an offset along its axis
 */
const useScrollPagingReporter = (
  name: string | undefined,
  horizontal: boolean,
  handlers: ScrollPagingHandlers,
  scrollToOffset: (offset: number) => void,
): ScrollPagingHandlers => {
  const metrics = useRef({ offset: 0, viewport: 0, content: 0 });
  const scrollTo = useRef(scrollToOffset);
  useEffect(() => {
    scrollTo.current = scrollToOffset;
  }, [scrollToOffset]);
  const { onScroll, onLayout, onContentSizeChange } = handlers;

  const report = useCallback(() => {
    if (!name) return;
    const { offset, viewport, content } = metrics.current;
    const paging = scrollPagingOf(offset, viewport, content);
    if (paging) setScrollPaging(name, paging);
  }, [name]);

  useEffect(() => {
    if (!name) return undefined;
    // What was measured before this effect ran (again, under a new name or
    // after a remount) is still true: publish it.
    report();
    const unsubscribe = subscribeScrollPageRequests(name, (page) =>
      scrollTo.current(page * metrics.current.viewport),
    );
    return () => {
      unsubscribe();
      clearScrollPaging(name);
    };
  }, [name, report]);

  const handleScroll = useCallback(
    (event: ScrollEvent) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      metrics.current = horizontal
        ? {
            offset: contentOffset.x,
            viewport: layoutMeasurement.width,
            content: contentSize.width,
          }
        : {
            offset: contentOffset.y,
            viewport: layoutMeasurement.height,
            content: contentSize.height,
          };
      report();
      onScroll?.(event);
    },
    [horizontal, onScroll, report],
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      metrics.current.viewport = horizontal ? width : height;
      report();
      onLayout?.(event);
    },
    [horizontal, onLayout, report],
  );

  const handleContentSizeChange = useCallback(
    (width: number, height: number) => {
      metrics.current.content = horizontal ? width : height;
      report();
      onContentSizeChange?.(width, height);
    },
    [horizontal, onContentSizeChange, report],
  );

  if (!name) return handlers;

  return {
    onScroll: handleScroll,
    onLayout: handleLayout,
    onContentSizeChange: handleContentSizeChange,
  };
};

export default useScrollPagingReporter;
