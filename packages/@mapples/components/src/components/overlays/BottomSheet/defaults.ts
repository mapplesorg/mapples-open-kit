import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  sheet: {
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 24,
    gap: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  content: {
    padding: 24,
    gap: 12,
  },
});
