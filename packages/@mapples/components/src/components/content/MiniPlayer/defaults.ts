import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 12,
    paddingStart: 8,
    paddingEnd: 4,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  artwork: {
    overflow: 'hidden',
  },
  text: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
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
