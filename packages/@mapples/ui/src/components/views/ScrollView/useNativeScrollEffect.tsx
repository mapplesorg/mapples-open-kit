import { ReactNode, useCallback, useMemo, useState } from 'react';

import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollViewProps,
  ViewStyle,
} from 'react-native';

import {
  ScrollEffect,
  scrollEffectInset,
  scrollEffectStart,
} from './scrollEffect';
import ScrollEffectItems from './ScrollEffectItems';

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

interface Handlers {
  onScroll?: ((event: ScrollEvent) => void) | null;
  onLayout?: ((event: LayoutChangeEvent) => void) | null;
}

interface NativeScrollEffect extends Handlers {
  /** Props the effect sets on the scroll view (the author's own come after). */
  props: Partial<ScrollViewProps>;
  /** Padding that lets the first and last item reach the centre. */
  contentInset: ViewStyle | null;
  /** The children, each in its item view. */
  wrap: (children: ReactNode) => ReactNode;
}

const NATIVE = Platform.OS !== 'web';

/**
 * A {@link ScrollEffect} on native: the scroll offset and the viewport are
 * kept in state, the scroll view snaps by `itemSize`, opens on the initial
 * item and pads its content, and each child is wrapped in an item view
 * (`ScrollEffectItems`). On the web, and without an effect, the handlers and
 * the children pass through untouched (`useWebScrollEffect` does the web).
 *
 * The offset travels through React state, one render of the item views per
 * scroll event; the items' own content is not re-rendered.
 */
const useNativeScrollEffect = (
  effect: ScrollEffect | undefined,
  horizontal: boolean,
  handlers: Handlers,
): NativeScrollEffect => {
  const active = NATIVE ? effect : undefined;
  const start = active ? scrollEffectStart(active) : 0;
  const [offset, setOffset] = useState(start);
  const [viewport, setViewport] = useState(0);
  const { onScroll, onLayout } = handlers;

  const handleScroll = useCallback(
    (event: ScrollEvent) => {
      const { x, y } = event.nativeEvent.contentOffset;
      setOffset(horizontal ? x : y);
      onScroll?.(event);
    },
    [horizontal, onScroll],
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setViewport(horizontal ? width : height);
      onLayout?.(event);
    },
    [horizontal, onLayout],
  );

  const props = useMemo<Partial<ScrollViewProps>>(() => {
    if (!active) return {};
    return {
      snapToInterval: active.itemSize,
      decelerationRate: 'fast',
      contentOffset: horizontal ? { x: start, y: 0 } : { x: 0, y: start },
    };
  }, [active, horizontal, start]);

  const contentInset = useMemo<ViewStyle | null>(() => {
    if (!active) return null;
    const inset = scrollEffectInset(active, viewport);
    return horizontal
      ? { paddingHorizontal: inset }
      : { paddingVertical: inset };
  }, [active, horizontal, viewport]);

  const wrap = useCallback(
    (children: ReactNode): ReactNode =>
      active ? (
        <ScrollEffectItems
          effect={active}
          offset={offset}
          horizontal={horizontal}
        >
          {children}
        </ScrollEffectItems>
      ) : (
        children
      ),
    [active, horizontal, offset],
  );

  if (!active) {
    return { onScroll, onLayout, props: EMPTY, contentInset, wrap };
  }

  return {
    onScroll: handleScroll,
    onLayout: handleLayout,
    props,
    contentInset,
    wrap,
  };
};

const EMPTY: Partial<ScrollViewProps> = {};

export default useNativeScrollEffect;
