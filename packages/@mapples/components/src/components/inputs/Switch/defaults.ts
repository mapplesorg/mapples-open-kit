import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 12,
  },
  labels: {
    flexShrink: 1,
    gap: 2,
  },
  track: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
