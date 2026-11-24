import { RefObject, useEffect } from 'react';

import { Platform } from 'react-native';

import {
  ScrollEffect,
  scrollEffectInset,
  scrollEffectItem,
  scrollEffectStart,
} from './scrollEffect';

interface ScrollableHost {
  getScrollableNode?: () => unknown;
}

/**
 * A {@link ScrollEffect} on the web. The items are styled in the DOM as the
 * scroll node moves, not wrapped in React: a design canvas hands a scroll
 * view its children as one composite child, so there is nothing to wrap per
 * item there, and a scroll then costs no render. The scroll node holds one
 * content container whose element children are the items.
 *
 * With `live` false (a design canvas) the items are drawn once, at rest on
 * the initial item.
 *
 * @param scrollView - The scroll view (react-native-web's instance)
 * @param effect - The effect, or nothing
 * @param horizontal - The scroll axis
 * @param live - Whether the items follow the scroll
 */
const useWebScrollEffect = (
  scrollView: RefObject<ScrollableHost | null>,
  effect: ScrollEffect | undefined,
  horizontal: boolean,
  live: boolean,
) => {
  // The effect is plain data written inline: compare it by value.
  const key = effect ? JSON.stringify(effect) : '';

  useEffect(() => {
    if (Platform.OS !== 'web' || !key) return undefined;
    const node = scrollView.current?.getScrollableNode?.();
    if (!(node instanceof HTMLElement)) return undefined;
    const content = node.firstElementChild;
    if (!(content instanceof HTMLElement)) return undefined;
    const settings = JSON.parse(key) as ScrollEffect;
    const start = scrollEffectStart(settings);
    const touched = new Set<HTMLElement>();

    const viewport = () => (horizontal ? node.clientWidth : node.clientHeight);
    const offset = () => (horizontal ? node.scrollLeft : node.scrollTop);

    const pad = () => {
      const inset = `${scrollEffectInset(settings, viewport())}px`;
      if (horizontal) {
        content.style.paddingLeft = inset;
        content.style.paddingRight = inset;
      } else {
        content.style.paddingTop = inset;
        content.style.paddingBottom = inset;
      }
    };

    const draw = (at: number) => {
      Array.from(content.children).forEach((child, index) => {
        if (!(child instanceof HTMLElement)) return;
        const item = scrollEffectItem(settings, index, at);
        const turn = horizontal ? 'rotateY' : 'rotateX';
        const shift = horizontal ? 'translateY' : 'translateX';
        child.style.transform = `perspective(${item.perspective}px) ${shift}(${item.translate}px) ${turn}(${item.rotate}deg) scale(${item.scale})`;
        child.style.transformOrigin = settings.origin ?? '';
        child.style.opacity = String(item.opacity);
        child.style.zIndex = String(item.zIndex);
        child.style.flexShrink = '0';
        touched.add(child);
      });
    };

    pad();
    if (horizontal) node.scrollLeft = start;
    else node.scrollTop = start;
    draw(live ? offset() : start);

    const onScroll = () => draw(offset());
    const onResize = () => {
      pad();
      draw(live ? offset() : start);
    };
    // Items added, removed or re-rendered lose the look: draw them again.
    const observer = new MutationObserver(onResize);
    observer.observe(content, { childList: true });
    const resize = new ResizeObserver(onResize);
    resize.observe(node);
    if (live) node.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      node.removeEventListener('scroll', onScroll);
      observer.disconnect();
      resize.disconnect();
      for (const child of touched) {
        child.style.transform = '';
        child.style.transformOrigin = '';
        child.style.opacity = '';
        child.style.zIndex = '';
        child.style.flexShrink = '';
      }
      content.style.paddingLeft = '';
      content.style.paddingRight = '';
      content.style.paddingTop = '';
      content.style.paddingBottom = '';
    };
  }, [scrollView, key, horizontal, live]);
};

export default useWebScrollEffect;
