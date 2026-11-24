import { RefObject, useEffect } from 'react';

import { Platform } from 'react-native';

const ATTRIBUTE = 'data-mapples-paging';
const STYLE_ID = 'mapples-scroll-paging';

// The scroll node holds one content container, and that holds the pages.
const RULES = `
[${ATTRIBUTE}="x"]{scroll-snap-type:x mandatory}
[${ATTRIBUTE}="y"]{scroll-snap-type:y mandatory}
[${ATTRIBUTE}]>*>*{scroll-snap-align:start}
`;

interface ScrollableHost {
  getScrollableNode?: () => unknown;
}

/**
 * `pagingEnabled` on the web. react-native-web pages by wrapping every child
 * of the scroll view in a view of its own, which a native scroll view does
 * not do: a page sized against the content container (`flex: 1`, a
 * percentage width) then sizes against that wrapper and comes out as wide as
 * its content, so the pages no longer match the viewport. Here the scroll
 * node is marked instead and one style rule snaps its pages, leaving the
 * children where the author put them.
 *
 * @param scrollView - The scroll view (react-native-web's instance)
 * @param enabled - Whether the scroll view pages
 * @param horizontal - The scroll axis
 */
const useWebPaging = (
  scrollView: RefObject<ScrollableHost | null>,
  enabled: boolean,
  horizontal: boolean,
) => {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return undefined;
    const node = scrollView.current?.getScrollableNode?.();
    if (!(node instanceof HTMLElement)) return undefined;

    const root = node.ownerDocument;
    if (!root.getElementById(STYLE_ID)) {
      const style = root.createElement('style');
      style.id = STYLE_ID;
      style.textContent = RULES;
      root.head.appendChild(style);
    }
    node.setAttribute(ATTRIBUTE, horizontal ? 'x' : 'y');
    return () => node.removeAttribute(ATTRIBUTE);
  }, [scrollView, enabled, horizontal]);
};

/** Whether the scroll view pages through {@link useWebPaging} instead of the platform. */
export const PAGES_ON_WEB = Platform.OS === 'web';

export default useWebPaging;
