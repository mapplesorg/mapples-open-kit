import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  icon: {
    paddingTop: 1,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
    // Aligns the text buttons' labels with the message above.
    marginStart: -8,
  },
  close: {
    width: 32,
    height: 32,
    marginTop: -5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
