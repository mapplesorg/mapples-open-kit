import { useEffect, useState } from 'react';

import { useMotionEnabled } from '@mapples/style';
import { AccessibilityInfo, Easing, Platform } from 'react-native';

/** Standard transition length in ms. */
export const DURATION = { fast: 120, base: 200, slow: 320 } as const;

/** Standard easing of transitions. */
export const EASING = Easing.bezier(0.2, 0, 0, 1);

/**
 * Whether the native animation driver may be used. On the web the native
 * animated module is absent; `useNativeDriver: true` there only logs a
 * warning and falls back to the JS driver, so ask for it only off-web.
 */
export const NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * Whether motion should be left out: the person asked the OS to reduce it,
 * or a `MotionProvider` turned it off where the component renders. Loops
 * and decorative transitions are skipped while it holds.
 */
export const useReduceMotion = (): boolean => {
  const [reduce, setReduce] = useState(false);
  const motionEnabled = useMotionEnabled();

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduce(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduce,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  // Also where a `MotionProvider` turned motion off (a design canvas).
  return reduce || !motionEnabled;
};
