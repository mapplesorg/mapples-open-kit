import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  month: {
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  day: {
    textAlign: 'center',
    fontWeight: '700',
  },
  time: {
    textAlign: 'center',
    marginTop: 2,
  },
});
