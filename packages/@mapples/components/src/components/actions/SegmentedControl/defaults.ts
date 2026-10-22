import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  indicator: {
    position: 'absolute',
    left: 0,
  },
  outlined: {
    overflow: 'hidden',
  },
  divider: {
    alignSelf: 'stretch',
  },
  struck: {
    textDecorationLine: 'line-through',
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
