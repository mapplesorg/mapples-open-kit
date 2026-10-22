import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  dotsRow: {
    alignItems: 'center',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
