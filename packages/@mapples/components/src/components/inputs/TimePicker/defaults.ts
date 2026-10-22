import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  column: {
    overflow: 'hidden',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  separator: {
    textAlign: 'center',
  },
});
