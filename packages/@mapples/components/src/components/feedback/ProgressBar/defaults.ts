import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  segments: {
    flex: 1,
    flexDirection: 'row',
  },
  markerFrame: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  marker: {
    position: 'absolute',
  },
  label: {
    minWidth: 36,
    textAlign: 'right',
  },
});
