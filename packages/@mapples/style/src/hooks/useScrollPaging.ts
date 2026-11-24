import { useCallback, useSyncExternalStore } from 'react';

import { ScrollPagingState } from '../types';
import {
  getScrollPaging,
  SCROLL_PAGING_REST,
  subscribeScrollPaging,
} from '../utils/scrollPaging';

const subscribeNothing = () => () => undefined;
const getRest = () => SCROLL_PAGING_REST;

/**
 * The page in view and the page count of the paging scroll view called
 * `name` (a `ScrollView` with `pagingEnabled` and that `name`). Re-renders
 * the caller when the page or the count changes, never per scroll frame.
 * Without a name, or before that scroll view has measured, `count` is `0`.
 *
 * @example
 * ```tsx
 * const { page, count } = useScrollPaging('gallery');
 * ```
 */
const useScrollPaging = (name?: string): ScrollPagingState => {
  const subscribe = useCallback(
    (listener: () => void) =>
      name ? subscribeScrollPaging(name, listener) : subscribeNothing(),
    [name],
  );
  const get = useCallback(
    () => (name ? getScrollPaging(name) : SCROLL_PAGING_REST),
    [name],
  );
  return useSyncExternalStore(subscribe, get, getRest);
};

export default useScrollPaging;
