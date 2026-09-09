import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  media: {
    overflow: 'hidden',
  },
  content: {
    padding: 12,
    gap: 4,
  },
  contentHorizontal: {
    flex: 1,
    justifyContent: 'center',
  },
  tag: {
    position: 'absolute',
    top: 8,
    start: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stateLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
