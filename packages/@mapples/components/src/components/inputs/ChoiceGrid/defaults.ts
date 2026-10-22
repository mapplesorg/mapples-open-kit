import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
  cellCentred: {
    alignItems: 'center',
  },
  tile: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileStacked: {
    padding: 8,
    gap: 6,
  },
  swatchRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  strike: {
    position: 'absolute',
    height: 2,
    transform: [{ rotate: '-45deg' }],
  },
  check: {
    position: 'absolute',
    top: 4,
    right: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
