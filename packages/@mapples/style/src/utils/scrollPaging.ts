import { ScrollPagingState } from '../types';

/** A scroll view that has not measured yet: no pages known. */
export const SCROLL_PAGING_REST: ScrollPagingState = { page: 0, count: 0 };

type Listener = () => void;
type PageRequest = (page: number) => void;

// Keyed by the scroll view's `name`, like animation commands by the
// animation's: the scroll view and the element that follows it sit in
// different places of one screen and share nothing but the name.
const states = new Map<string, ScrollPagingState>();
const listeners = new Map<string, Set<Listener>>();
const requests = new Map<string, Set<PageRequest>>();

const add = <T>(map: Map<string, Set<T>>, name: string, item: T) => {
  const set = map.get(name) ?? new Set<T>();
  map.set(name, set);
  set.add(item);
  return () => {
    set.delete(item);
    if (set.size === 0) map.delete(name);
  };
};

/** Where the paging scroll view called `name` stands. */
export const getScrollPaging = (name: string): ScrollPagingState =>
  states.get(name) ?? SCROLL_PAGING_REST;

/** Called by the scroll view; notifies on a change only. */
export const setScrollPaging = (name: string, next: ScrollPagingState) => {
  const previous = getScrollPaging(name);
  if (previous.page === next.page && previous.count === next.count) return;
  states.set(name, next);
  listeners.get(name)?.forEach((listener) => listener());
};

/** Called when the scroll view leaves the screen. */
export const clearScrollPaging = (name: string) => {
  if (!states.delete(name)) return;
  listeners.get(name)?.forEach((listener) => listener());
};

export const subscribeScrollPaging = (name: string, listener: Listener) =>
  add(listeners, name, listener);

/** Asks the paging scroll view called `name` to show `page`. */
export const requestScrollPage = (name: string, page: number) => {
  requests.get(name)?.forEach((request) => request(page));
};

/** The scroll view's side of {@link requestScrollPage}. */
export const subscribeScrollPageRequests = (
  name: string,
  request: PageRequest,
) => add(requests, name, request);

/**
 * The page in view and the page count of a paging scroll view: one page is
 * one viewport along the scroll axis. `null` until the viewport is measured.
 */
export const scrollPagingOf = (
  offset: number,
  viewport: number,
  content: number,
): ScrollPagingState | null => {
  if (viewport <= 0) return null;
  const count = Math.max(1, Math.round(content / viewport));
  const page = Math.min(count - 1, Math.max(0, Math.round(offset / viewport)));
  return { page, count };
};
