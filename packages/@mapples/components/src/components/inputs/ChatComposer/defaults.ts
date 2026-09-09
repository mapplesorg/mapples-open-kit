import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    gap: 8,
  },
  leading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  inputWrap: {
    flex: 1,
  },
  mirror: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
  },
  input: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    textAlignVertical: 'center',
  },
  send: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
