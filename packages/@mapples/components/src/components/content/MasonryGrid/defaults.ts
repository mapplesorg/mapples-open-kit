import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  tile: {
    gap: 6,
  },
  media: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
  },
  tag: {
    position: 'absolute',
    bottom: 8,
    start: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
