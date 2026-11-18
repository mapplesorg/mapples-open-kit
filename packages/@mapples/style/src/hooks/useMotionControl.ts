import { useEffect, useState } from 'react';

import { ONE_OFF_ANIMATION_DURATION } from '../constants/motion';
import { subscribeMotionCommands } from '../utils/motionCommands';

import useScreenFocusCount from './useScreenFocusCount';

type Style = Record<string, unknown>;

interface ControlState {
  /** A `pause` command holds until `play` or `restart`. */
  paused: boolean;
  /**
   * One frame without the animation, after which it is back: removing an
   * animation and adding it again is what starts it from its first keyframe
   * without remounting the element (and losing what its children hold).
   */
  restarting: boolean;
  /** A preset played once in place of the element's own animation. */
  oneOff?: { animationName: string; animationDuration: string | number };
}

const REST: ControlState = { paused: false, restarting: false };

const ANIMATION_KEYS = [
  'animationName',
  'animationDuration',
  'animationTimingFunction',
  'animationDelay',
  'animationIterationCount',
  'animationDirection',
  'animationFillMode',
  'animationPlayState',
] as const;

const withoutAnimation = (style: Style): Style =>
  Object.fromEntries(
    Object.entries(style).filter(
      ([key]) => !(ANIMATION_KEYS as readonly string[]).includes(key),
    ),
  );

/**
 * A flattened style as the motion commands sent to the element and the
 * focus of its screen leave it: paused, starting again, or playing a one-off
 * preset. The element is addressed by the `motionName` of its style
 * (`sendMotionCommand`); `animationReplay: 'focus'` starts its animation
 * again each time its screen is shown.
 *
 * A style with neither key comes back as it is, and the element subscribes
 * to nothing.
 *
 * @param style - The flattened style of the element
 */
const useMotionControl = (style: Style | undefined): Style | undefined => {
  const name =
    typeof style?.motionName === 'string' ? style.motionName : undefined;
  const [state, setState] = useState(REST);
  const focusCount = useScreenFocusCount(style?.animationReplay === 'focus');

  useEffect(() => {
    if (!name) return undefined;

    return subscribeMotionCommands((message) => {
      if (message.target !== name) return;

      if (message.command === 'pause') {
        setState((current) => ({ ...current, paused: true }));
        return;
      }

      const { animation } = message;
      setState((current) => {
        if (message.command === 'play' && current.paused && !animation) {
          return { ...current, paused: false };
        }
        return {
          paused: false,
          restarting: true,
          oneOff: animation
            ? {
                animationName: animation,
                animationDuration:
                  message.duration ?? ONE_OFF_ANIMATION_DURATION,
              }
            : undefined,
        };
      });
    });
  }, [name]);

  // Shown again: start over. The first show is the mount, which plays the
  // animation by itself (the count starts where the screen's does).
  const [seenFocusCount, setSeenFocusCount] = useState(focusCount);
  if (seenFocusCount !== focusCount) {
    setSeenFocusCount(focusCount);
    setState((current) => ({ ...current, paused: false, restarting: true }));
  }

  useEffect(() => {
    if (!state.restarting) return undefined;

    const frame = requestAnimationFrame(() =>
      setState((current) => ({ ...current, restarting: false })),
    );
    return () => cancelAnimationFrame(frame);
  }, [state.restarting]);

  if (!style || state === REST) return style;
  if (state.restarting) return withoutAnimation(style);
  if (state.oneOff) {
    return {
      ...withoutAnimation(style),
      ...state.oneOff,
      ...(state.paused ? { animationPlayState: 'paused' } : null),
    };
  }
  return state.paused ? { ...style, animationPlayState: 'paused' } : style;
};

export default useMotionControl;
