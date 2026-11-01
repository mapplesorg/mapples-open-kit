import { Styler } from '@mapples/style';

import { BOTTOM_NAVIGATION_EXPAND } from '../BottomNavigationBar/types';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  /** Tabs sized to their content (`expand`), spread over the free width. */
  rootFit: {
    justifyContent: 'space-evenly',
    gap: BOTTOM_NAVIGATION_EXPAND.itemGap,
  },
});
