import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
  },
  plot: {
    alignSelf: 'stretch',
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
