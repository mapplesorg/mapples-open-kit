import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  trailing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailingWithChevron: {
    flexDirection: 'row',
    gap: 4,
  },
  radio: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
  },
  stateLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
