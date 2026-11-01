import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    gap: 12,
  },
  labels: {
    flexShrink: 1,
    gap: 2,
  },
  labelsGrow: {
    flexGrow: 1,
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
