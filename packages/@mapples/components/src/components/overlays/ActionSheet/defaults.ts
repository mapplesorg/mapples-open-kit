import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  container: {
    padding: 12,
    gap: 8,
  },
  group: {
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    gap: 4,
    alignItems: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 20,
  },
  cancel: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
