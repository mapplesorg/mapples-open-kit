import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  close: {
    marginStart: 2,
    marginEnd: -4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
