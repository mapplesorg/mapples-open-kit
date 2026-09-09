import { useEffect, useState } from 'react';

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
}

/**
 * An `Animated.Value` that eases to `target` whenever it changes. With
 * reduced motion enabled the value jumps instead. The value is never routed
 * through `styled` (it would serialize to a frozen scalar) — it belongs on an
 * `Animated.View` style.
 */
const useTimingValue = (
  target: number,
  { duration = DURATION.base, native = true }: TimingOptions = {},
): Animated.Value => {
  const [value] = useState(() => new Animated.Value(target));
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      value.setValue(target);
      return;
    }
    const animation = Animated.timing(value, {
      toValue: target,
      duration,
      easing: EASING,
      useNativeDriver: native && NATIVE_DRIVER,
    });
    animation.start();
    return () => animation.stop();
  }, [duration, native, reduceMotion, target, value]);

  return value;
};

export default useTimingValue;
