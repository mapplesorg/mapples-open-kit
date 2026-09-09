import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    gap: 8,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondCheck: {
    marginStart: -8,
  },
});
