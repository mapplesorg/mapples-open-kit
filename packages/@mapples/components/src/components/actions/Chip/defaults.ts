import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    overflow: 'hidden',
  },
  tileRoot: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    gap: 6,
  },
  tileCircle: {
    alignItems: 'center',
    justifyContent: 'center',
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
  struck: {
    textDecorationLine: 'line-through',
  },
});
