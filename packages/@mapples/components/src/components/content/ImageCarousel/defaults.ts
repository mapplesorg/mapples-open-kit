import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  // Children laid over the slides: a top row of glyph buttons by default.
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
  },
  indicatorBelow: {
    alignItems: 'center',
  },
  indicatorOver: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 12,
  },
  counter: {
    minHeight: 24,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBelow: {
    paddingVertical: 8,
  },
});
