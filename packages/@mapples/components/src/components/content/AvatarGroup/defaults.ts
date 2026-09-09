import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  ring: {
    overflow: 'hidden',
  },
  overflow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
