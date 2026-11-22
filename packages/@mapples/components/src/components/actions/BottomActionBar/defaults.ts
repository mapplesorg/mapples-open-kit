import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    padding: 16,
    gap: 12,
    zIndex: 10,
  },
  // With `hideOnScroll`: the bar eases off the bottom edge and back.
  scrolling: {
    transitionProperty: ['opacity', 'transform'],
    transitionDuration: '200ms',
  },
  hidden: { opacity: 0, transform: [{ translateY: '100%' }] },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
