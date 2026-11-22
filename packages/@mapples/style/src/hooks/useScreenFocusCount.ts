import { useContext, useSyncExternalStore } from 'react';

import ScreenMotionContext from '../context/ScreenMotionContext';

const subscribeNothing = () => () => undefined;
const getZero = () => 0;

/**
 * How many times the element's screen gained focus after the first time it
 * was shown; `0` outside a `ScreenMotionProvider`. Pass `false` to read
 * nothing: the caller is then not re-rendered when the screen is shown again.
 */
const useScreenFocusCount = (enabled = true): number => {
  const store = useContext(ScreenMotionContext);
  const active = enabled && store !== null;

  return useSyncExternalStore(
    active ? store.subscribeFocusCount : subscribeNothing,
    active ? store.getFocusCount : getZero,
    getZero,
  );
};

export default useScreenFocusCount;
