import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  // The glyph pops when the reaction is given: small, a little too big, at rest.
  pop: {
    animationName: 'bounceIn',
    animationDuration: '400ms',
  },
});
