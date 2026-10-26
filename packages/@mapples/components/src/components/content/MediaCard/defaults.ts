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
  contentPlain: {
    padding: 0,
    paddingTop: 8,
  },
  contentPlainHorizontal: {
    paddingTop: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
  },
  accessory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 6,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
  tag: {
    position: 'absolute',
    top: 8,
    start: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  action: {
    position: 'absolute',
    top: 8,
    end: 8,
  },
  pressSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stateLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
