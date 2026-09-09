import { useEffect, useState } from 'react';

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
 * Whether the person asked the OS to reduce motion. Loops and decorative
 * transitions are skipped while it is on.
 */
export const useReduceMotion = (): boolean => {
  const [reduce, setReduce] = useState(false);

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

  return reduce;
};
