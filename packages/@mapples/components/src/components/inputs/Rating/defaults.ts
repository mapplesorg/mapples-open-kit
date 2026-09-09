import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
  },
  star: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    top: 0,
    start: 0,
    bottom: 0,
    overflow: 'hidden',
  },
});
