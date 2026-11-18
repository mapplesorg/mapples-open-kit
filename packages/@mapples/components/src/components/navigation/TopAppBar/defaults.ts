import { Styler } from '@mapples/style';

import { TOP_APP_BAR_SCROLL_DURATION } from './types';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    paddingHorizontal: 4,
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titles: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 2,
  },
  titlesCentred: {
    alignItems: 'center',
  },
  centred: {
    textAlign: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  titleRowCentred: {
    justifyContent: 'center',
  },
  titleShrink: {
    flexShrink: 1,
  },
  largeTitles: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    justifyContent: 'flex-end',
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textAction: {
    paddingHorizontal: 12,
  },
  stateLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // A bar with a `scrollBehavior`: its lift, height and background ease
  // over, and what no longer fits while it shrinks is clipped.
  scrolling: {
    overflow: 'hidden',
    transitionProperty: 'all',
    transitionDuration: TOP_APP_BAR_SCROLL_DURATION,
  },
  hidden: { opacity: 0, borderBottomWidth: 0 },
  titlesMoving: {
    animationName: 'fadeIn',
    animationDuration: TOP_APP_BAR_SCROLL_DURATION,
  },
  mirrored: {
    transform: [{ scaleX: -1 }],
  },
});
