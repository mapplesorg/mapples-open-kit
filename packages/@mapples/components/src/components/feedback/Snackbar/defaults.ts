import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 12,
    paddingStart: 16,
    paddingEnd: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  message: {
    flex: 1,
  },
  action: {
    paddingHorizontal: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  close: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
