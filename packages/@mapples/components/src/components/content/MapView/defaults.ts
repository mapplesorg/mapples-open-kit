import { Styler } from '@mapples/style';

import {
  MAP_MARKER_DISC,
  MAP_MARKER_PILL_HEIGHT,
  MAP_MARKER_POINTER,
} from './types';

/** Width and height of the box a web pin is laid out in, centred on its point. */
export const MAP_MARKER_SLOT = 240;

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Web: a pin sits in a fixed box around its point, so it is placed without
  // measuring it. A price pin rests on the point; a glyph pin centres on it.
  slotBottom: {
    position: 'absolute',
    width: MAP_MARKER_SLOT,
    height: MAP_MARKER_SLOT / 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  slotCentre: {
    position: 'absolute',
    width: MAP_MARKER_SLOT,
    height: MAP_MARKER_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    alignItems: 'center',
  },
  pill: {
    height: MAP_MARKER_PILL_HEIGHT,
    minWidth: MAP_MARKER_PILL_HEIGHT,
    paddingHorizontal: 10,
    borderRadius: MAP_MARKER_PILL_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: MAP_MARKER_POINTER,
    borderRightWidth: MAP_MARKER_POINTER,
    borderTopWidth: MAP_MARKER_POINTER,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  disc: {
    width: MAP_MARKER_DISC,
    height: MAP_MARKER_DISC,
    borderRadius: MAP_MARKER_DISC / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
