import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  row: {
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  scrollRoot: {
    alignSelf: 'stretch',
  },
  scrollContent: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  cellEqual: {
    flex: 1,
    minWidth: 0,
  },
  marker: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
