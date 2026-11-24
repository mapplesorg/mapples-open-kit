import {
  ComponentRef,
  forwardRef,
  PropsWithChildren,
  Ref,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';

import {
  StyledScrollView,
  useMotionEnabled,
  useScreenScrollHandler,
  useScrollPagingReporter,
  WithStyledProps,
} from '@mapples/style';
import {
  ScrollView as RNScrollView,
  ScrollViewProps as RNScrollViewProps,
} from 'react-native';

import { ScrollEffect, usableScrollEffect } from './scrollEffect';
import useNativeScrollEffect from './useNativeScrollEffect';
import useWebPaging, { PAGES_ON_WEB } from './useWebPaging';
import useWebScrollEffect from './useWebScrollEffect';

/**
 * Props for the ScrollView component.
 *
 * @public
 */
export type ScrollViewProps = PropsWithChildren<
  WithStyledProps<RNScrollViewProps> & {
    /**
     * What a `PageControl` calls this scroll view by (its `target`). With
     * `pagingEnabled`, the scroll view then reports its page and page count,
     * and scrolls to the page a dot asks for.
     */
    name?: string;
    /**
     * Makes the items follow the scroll: the one at the centre at full size,
     * its neighbours smaller, turned and dimmed (a coverflow shelf). The
     * scroll view then snaps item by item, centres the first and last item
     * and opens on `initialItem`. See {@link ScrollEffect}.
     */
    scrollEffect?: ScrollEffect;
  }
>;

const SCREEN_SCROLL_THROTTLE = 16;

/**
 * A customizable scrollable view component with built-in styling support.
 *
 * The ScrollView component extends React Native's ScrollView with additional styling
 * capabilities through the @mapples/style system. It provides a scrollable container
 * with hidden scroll indicators by default. A vertical ScrollView also drives
 * the elements of its screen that react to scrolling (`useScreenScroll` in
 * `@mapples/style`): a `TopAppBar` with a `scrollBehavior`, a `Fab` with
 * `hideOnScroll`.
 *
 * @example
 * ```tsx
 * <ScrollView
 *   styled={{
 *     style: {
 *       backgroundColor: 'white',
 *       padding: 16,
 *     },
 *   }}
 * >
 *   <Text>Scrollable content goes here</Text>
 *   <Text>More content...</Text>
 * </ScrollView>
 * ```
 *
 * @public
 */
const ScrollView = forwardRef(
  (
    {
      styled,
      children,
      onScroll,
      onLayout,
      onContentSizeChange,
      horizontal,
      pagingEnabled,
      name,
      scrollEffect,
      scrollEventThrottle,
      ...props
    }: ScrollViewProps,
    ref,
  ) => {
    const inner = useRef<ComponentRef<typeof RNScrollView>>(null);
    useImperativeHandle(ref, () => inner.current);

    // A vertical scroll view tells its screen where it stands while an
    // element there reacts to scrolling (a TopAppBar that lifts, a Fab that
    // hides); otherwise the handler is the author's own, untouched.
    const handleScroll = useScreenScrollHandler(onScroll, !horizontal);
    const reporting = handleScroll !== (onScroll ?? undefined);

    // Still where a `MotionProvider` turned motion off (a design canvas):
    // the items of a scroll effect are drawn at rest there.
    const motionEnabled = useMotionEnabled();
    const effect = usableScrollEffect(scrollEffect);

    // On the web the pages (or the items of a scroll effect) are snapped
    // here, not by react-native-web, and the effect is drawn in the DOM.
    useWebPaging(inner, !!pagingEnabled || !!effect, !!horizontal, !!effect);
    useWebScrollEffect(inner, effect, !!horizontal, motionEnabled);
    const items = useNativeScrollEffect(effect, !!horizontal, {
      onScroll: handleScroll,
      onLayout,
    });

    // A named paging scroll view also tells a `PageControl` its page.
    const pagingName = pagingEnabled ? name : undefined;
    const scrollToOffset = useCallback(
      (offset: number) =>
        inner.current?.scrollTo(
          horizontal
            ? { x: offset, animated: true }
            : { y: offset, animated: true },
        ),
      [horizontal],
    );
    const paging = useScrollPagingReporter(
      pagingName,
      !!horizontal,
      {
        onScroll: items.onScroll,
        onLayout: items.onLayout,
        onContentSizeChange,
      },
      scrollToOffset,
    );

    return (
      <StyledScrollView
        showsVerticalScrollIndicator={false}
        ref={inner as Ref<unknown>}
        styled={
          items.contentInset
            ? {
                ...styled,
                contentContainerStyle: [
                  styled?.contentContainerStyle,
                  items.contentInset,
                ],
              }
            : { ...styled }
        }
        horizontal={horizontal}
        pagingEnabled={PAGES_ON_WEB ? false : pagingEnabled}
        onScroll={paging.onScroll ?? undefined}
        onLayout={paging.onLayout ?? undefined}
        onContentSizeChange={paging.onContentSizeChange ?? undefined}
        scrollEventThrottle={
          scrollEventThrottle ??
          (reporting || pagingName || effect
            ? SCREEN_SCROLL_THROTTLE
            : undefined)
        }
        {...items.props}
        {...props}
      >
        {items.wrap(children)}
      </StyledScrollView>
    );
  },
);
ScrollView.displayName = 'ScrollView';

export default ScrollView;
