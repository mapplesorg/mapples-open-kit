import { Styler } from '@mapples/style';

import { LIST_CHANGE_DURATION } from '../List/types';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
  },
  // The tiles a swipe reveals, as tall as the row.
  swipeActions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  swipeAction: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  // A row of an animated `List`: it fades out when it leaves and slides to
  // its new place when a neighbour comes or goes.
  changing: {
    layoutTransitionDuration: LIST_CHANGE_DURATION,
    exitAnimationName: 'fadeOut',
    exitAnimationDuration: LIST_CHANGE_DURATION,
  },
  // One that joined such a list after it was first shown.
  joining: {
    animationName: 'fadeIn',
    animationDuration: LIST_CHANGE_DURATION,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  leading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  trailing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailingWithChevron: {
    flexDirection: 'row',
    gap: 4,
  },
  radio: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
  },
  stateLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
