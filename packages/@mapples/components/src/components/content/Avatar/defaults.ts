import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  status: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
});
