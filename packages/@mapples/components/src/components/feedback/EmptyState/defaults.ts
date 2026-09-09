import { Styler } from '@mapples/style';

import { EMPTY_STATE_GEOMETRY } from './types';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  image: {
    width: '100%',
    maxWidth: EMPTY_STATE_GEOMETRY.contentWidth,
    height: EMPTY_STATE_GEOMETRY.imageHeight,
    marginBottom: 4,
  },
  icon: {
    width: EMPTY_STATE_GEOMETRY.iconCircle,
    height: EMPTY_STATE_GEOMETRY.iconCircle,
    borderRadius: EMPTY_STATE_GEOMETRY.iconCircle / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    textAlign: 'center',
    maxWidth: EMPTY_STATE_GEOMETRY.contentWidth,
  },
  message: {
    textAlign: 'center',
    maxWidth: EMPTY_STATE_GEOMETRY.contentWidth,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
});
