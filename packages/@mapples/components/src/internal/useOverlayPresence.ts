import { useEffect, useState } from 'react';

import { Animated } from 'react-native';

import { DURATION, EASING, NATIVE_DRIVER, useReduceMotion } from './animation';

export interface OverlayPresence {
  /** Whether the overlay should be in the tree (stays through the exit animation). */
  mounted: boolean;
  /** 0 → 1 while entering, 1 → 0 while leaving; drives opacity/transform. */
  progress: Animated.Value;
}

/**
 * Keeps an overlay mounted while its exit animation plays. Mounts as soon as
 * `visible` turns true and runs `progress` to 1; on false runs it back to 0
 * and only then unmounts. Under reduced motion the transition is instant.
 */
const useOverlayPresence = (
  visible: boolean,
  duration: number = DURATION.base,
): OverlayPresence => {
  const [progress] = useState(() => new Animated.Value(visible ? 1 : 0));
  const [shown, setShown] = useState(visible);
  const reduceMotion = useReduceMotion();

  // Showing mounts immediately — derived during render, before the effect
  // that animates it in.
  if (visible && !shown) setShown(true);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: reduceMotion ? 0 : duration,
      easing: EASING,
      useNativeDriver: NATIVE_DRIVER,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) setShown(false);
    });
    return () => animation.stop();
  }, [duration, progress, reduceMotion, visible]);

  return { mounted: visible || shown, progress };
};

export default useOverlayPresence;
