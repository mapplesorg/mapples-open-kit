import { forwardRef, PropsWithChildren } from 'react';

import {
  StyledScrollView,
  useScreenScrollHandler,
  WithStyledProps,
} from '@mapples/style';
import { ScrollViewProps as RNScrollViewProps } from 'react-native';

/**
 * Props for the ScrollView component.
 *
 * @public
 */
export type ScrollViewProps = PropsWithChildren<
  WithStyledProps<RNScrollViewProps>
>;

/** Milliseconds between the scroll events a screen's chrome reacts to. */
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
      horizontal,
      scrollEventThrottle,
      ...props
    }: ScrollViewProps,
    ref,
  ) => {
    // A vertical scroll view tells its screen where it stands while an
    // element there reacts to scrolling (a TopAppBar that lifts, a Fab that
    // hides); otherwise the handler is the author's own, untouched.
    const handleScroll = useScreenScrollHandler(onScroll, !horizontal);
    const reporting = handleScroll !== (onScroll ?? undefined);

    return (
      <StyledScrollView
        showsVerticalScrollIndicator={false}
        ref={ref}
        styled={{ ...styled }}
        horizontal={horizontal}
        onScroll={handleScroll}
        scrollEventThrottle={
          scrollEventThrottle ??
          (reporting ? SCREEN_SCROLL_THROTTLE : undefined)
        }
        {...props}
      >
        {children}
      </StyledScrollView>
    );
  },
);
ScrollView.displayName = 'ScrollView';

export default ScrollView;
