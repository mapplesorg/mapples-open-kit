import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    gap: 4,
  },
  histogram: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bar: {
    flex: 1,
  },
  row: {
    justifyContent: 'center',
  },
  track: {
    overflow: 'hidden',
  },
  range: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  thumb: {
    position: 'absolute',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.25)',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
