import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
  },
  main: {
    gap: 12,
  },
  stub: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  perforationAcross: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
  },
  perforationDown: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  line: {
    flex: 1,
  },
  notch: {
    position: 'absolute',
  },
  stubText: {
    textAlign: 'center',
  },
});
