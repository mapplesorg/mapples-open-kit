import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    gap: 6,
  },
  header: {
    gap: 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  bare: {
    paddingHorizontal: 0,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
});
