import { Styler } from '@mapples/style';

import { LINE_CHART_WIPE_KEYFRAMES } from './types';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
  },
  plot: {
    alignSelf: 'stretch',
  },
  // With `animate`: the guide lines stay put under the wipe.
  gridLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  // With `animate`: a window over the line that opens from the start edge,
  // so the line (with its area and markers) draws in.
  wipe: {
    overflow: 'hidden',
    animationName: LINE_CHART_WIPE_KEYFRAMES,
    animationDuration: '700ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'backwards',
  },
  labels: {
    marginTop: 6,
  },
  // Keeps the label row as tall as one label; the visible labels are
  // positioned absolutely under their points.
  labelSpacer: {
    opacity: 0,
  },
  label: {
    position: 'absolute',
    top: 0,
  },
});
