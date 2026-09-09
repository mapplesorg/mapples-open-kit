import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  table: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cell: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cellDense: {
    paddingVertical: 4,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  stateLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
