import { Styler } from '@mapples/style';

import { LIVE_INDICATOR_RING_KEYFRAMES } from './types';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  dotBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    animationName: LIVE_INDICATOR_RING_KEYFRAMES,
    animationDuration: '1600ms',
    animationTimingFunction: 'ease-out',
    animationIterationCount: 'infinite',
  },
});
