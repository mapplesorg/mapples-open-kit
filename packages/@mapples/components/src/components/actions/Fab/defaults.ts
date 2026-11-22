import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  // With `hideOnScroll`: the button eases out of the way and back.
  scrolling: {
    transitionProperty: ['opacity', 'transform'],
    transitionDuration: '200ms',
  },
  hidden: { opacity: 0, transform: [{ scale: 0.6 }] },
  stateLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
