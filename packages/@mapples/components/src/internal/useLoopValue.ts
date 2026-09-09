import { useEffect, useState } from 'react';

import { Animated, Easing } from 'react-native';

import { NATIVE_DRIVER, useReduceMotion } from './animation';

export interface LoopOptions {
  /** Start of the loop. */
  from?: number;
  /** End of the loop. */
  to?: number;
  /** One direction's length in ms. */
  duration?: number;
  /** Whether the loop runs; stopping resets the value to `from`. */
  running?: boolean;
  /** Bounce back (`true`) or restart from `from` (`false`). */
  reverse?: boolean;
  /** Use the native driver (opacity/transform only). */
  native?: boolean;
}

/**
 * A looping `Animated.Value` for pulses, shimmers and indeterminate
 * indicators. Stops on unmount, when `running` turns false and under reduced
 * motion (the value then rests at `from`).
 */
const useLoopValue = ({
  from = 0,
  to = 1,
  duration = 900,
  running = true,
  reverse = true,
  native = true,
}: LoopOptions = {}): Animated.Value => {
  const [value] = useState(() => new Animated.Value(from));
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (!running || reduceMotion) {
      value.setValue(from);
      return;
    }
    const useNativeDriver = native && NATIVE_DRIVER;
    const forward = Animated.timing(value, {
      toValue: to,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver,
    });
    const loop = Animated.loop(
      reverse
        ? Animated.sequence([
            forward,
            Animated.timing(value, {
              toValue: from,
              duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver,
            }),
          ])
        : Animated.sequence([
            forward,
            Animated.timing(value, {
              toValue: from,
              duration: 0,
              useNativeDriver,
            }),
          ]),
    );
    loop.start();
    return () => loop.stop();
  }, [duration, from, native, reduceMotion, reverse, running, to, value]);

  return value;
};

export default useLoopValue;
