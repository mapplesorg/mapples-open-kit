import { useEffect, useRef, useState } from 'react';

import { Animated } from 'react-native';

import { DURATION, EASING, NATIVE_DRIVER, useReduceMotion } from './animation';

export interface TimingOptions {
  /** Transition length in ms. */
  duration?: number;
  /**
   * Use the native driver (opacity/transform only). Pass `false` for layout
   * properties such as `height`, which the native driver cannot animate.
   */
  native?: boolean;
  /**
   * Where the value stands when the component appears, when that is not the
   * target: the first transition then runs from here (a bar that fills from
   * empty). Ignored with reduced motion.
   */
  from?: number;
  /** How long the first transition waits before it starts, in ms. */
  delay?: number;
}

/**
 * An `Animated.Value` that eases to `target` whenever it changes. With
 * reduced motion enabled the value jumps instead. The value is never routed
 * through `styled` (it would serialize to a frozen scalar) — it belongs on an
 * `Animated.View` style.
 */
const useTimingValue = (
  target: number,
  {
    duration = DURATION.base,
    native = true,
    from,
    delay = 0,
  }: TimingOptions = {},
): Animated.Value => {
  const [value] = useState(() => new Animated.Value(from ?? target));
  const reduceMotion = useReduceMotion();
  const firstRun = useRef(true);

  useEffect(() => {
    const wait = firstRun.current ? delay : 0;
    firstRun.current = false;

    if (reduceMotion) {
      value.setValue(target);
      return;
    }
    const animation = Animated.timing(value, {
      toValue: target,
      duration,
      delay: wait,
      easing: EASING,
      useNativeDriver: native && NATIVE_DRIVER,
    });
    animation.start();
    return () => animation.stop();
    // `delay` only shapes the first transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, native, reduceMotion, target, value]);

  return value;
};

export default useTimingValue;
