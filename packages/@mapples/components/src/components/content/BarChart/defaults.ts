import { Styler } from '@mapples/style';

import { BAR_CHART_GROW_KEYFRAMES } from './types';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
  },
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  grid: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  column: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  // With `animate`: grows out of the baseline when the chart appears (each
  // bar a little after the one before; the delay is set per bar) and eases
  // to its new height when the data changes.
  barAnimated: {
    transformOrigin: 'bottom',
    animationName: BAR_CHART_GROW_KEYFRAMES,
    animationDuration: '500ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'backwards',
    transitionProperty: 'height',
    transitionDuration: '300ms',
  },
  value: {
    marginBottom: 4,
    textAlign: 'center',
  },
  labels: {
    flexDirection: 'row',
    marginTop: 6,
  },
  label: {
    flex: 1,
    textAlign: 'center',
  },
});
