import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  split: {
    gap: 8,
  },
  label: {
    paddingStart: 12,
    paddingEnd: 4,
  },
  labelSplit: {
    paddingStart: 0,
    paddingEnd: 4,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    minWidth: 32,
    textAlign: 'center',
  },
});
