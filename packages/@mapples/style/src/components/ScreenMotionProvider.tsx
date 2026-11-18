import { FC, PropsWithChildren, useEffect, useState } from 'react';

import ScreenMotionContext from '../context/ScreenMotionContext';
import { createScreenMotionStore } from '../utils/screenMotion';

/** Props for {@link ScreenMotionProvider}. */
export interface ScreenMotionProviderProps {
  /**
   * How many times the screen gained focus after the first time it was
   * shown. An element with `animationReplay: 'focus'` plays its animation
   * again whenever this grows.
   */
  focusCount?: number;
}

/**
 * Wraps one screen so its elements can react to each other's motion: the
 * screen's vertical scroll views report where they stand (`useScreenScroll`)
 * and enter animations can replay when the screen is shown again.
 * `@mapples/navigation` puts one around every route's page.
 *
 * @example
 * ```tsx
 * <ScreenMotionProvider focusCount={timesShownAgain}>
 *   <Page />
 * </ScreenMotionProvider>
 * ```
 */
const ScreenMotionProvider: FC<
  PropsWithChildren<ScreenMotionProviderProps>
> = ({ focusCount = 0, children }) => {
  const [store] = useState(createScreenMotionStore);

  useEffect(() => {
    store.setFocusCount(focusCount);
  }, [focusCount, store]);

  return (
    <ScreenMotionContext.Provider value={store}>
      {children}
    </ScreenMotionContext.Provider>
  );
};

export default ScreenMotionProvider;
