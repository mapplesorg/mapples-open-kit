import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: 16,
  },
  dial: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  ringFill: {
    flex: 1,
  },
  centre: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  text: {
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
