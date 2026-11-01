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
    alignItems: 'center',
    justifyContent: 'center',
  },
  key: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyStretch: {
    alignSelf: 'stretch',
  },
  label: {
    textAlign: 'center',
  },
  separatorRow: {
    alignSelf: 'stretch',
  },
  separatorColumn: {
    alignSelf: 'stretch',
  },
});
