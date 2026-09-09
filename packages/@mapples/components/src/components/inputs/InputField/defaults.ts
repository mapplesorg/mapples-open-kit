import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    gap: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    minWidth: 0,
  },
  multiline: {
    alignItems: 'flex-start',
  },
  glyphButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
