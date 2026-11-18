import { useMemo } from 'react';

import { Keyframe, LinearTransition } from 'react-native-reanimated';

import { EXIT_ANIMATION_DURATION } from '../constants/motion';
import { parseMotionTime, resolveExitKeyframes } from '../utils/motion';

type Style = Record<string, unknown>;

/** The props an animated host takes besides its style. */
export interface HostMotion {
  /** Plays when the host unmounts; Reanimated keeps the view until it ends. */
  exiting?: InstanceType<typeof Keyframe>;
  /** Animates the host to its new frame when the layout around it changes. */
  layout?: LinearTransition;
}

/**
 * Reanimated's `exiting` and `layout` animations for a flattened style that
 * carries `exitAnimationName` / `layoutTransitionDuration`. They are rebuilt
 * only when those keys change, so a re-render does not register new
 * animations. With `reducedMotion` there are none.
 *
 * @param style - The flattened style of the element
 * @param reducedMotion - Whether the OS asks for reduced motion
 */
const useHostMotion = (
  style: Style | undefined,
  reducedMotion: boolean,
): HostMotion => {
  const exitName = style?.exitAnimationName;
  // Keyframes written in place are a new object on every render.
  const exitKey =
    typeof exitName === 'object' && exitName !== null
      ? JSON.stringify(exitName)
      : (exitName as string | undefined);
  const exitDuration = parseMotionTime(style?.exitAnimationDuration);
  const exitDelay = parseMotionTime(style?.exitAnimationDelay);
  const layoutDuration = parseMotionTime(style?.layoutTransitionDuration);

  const exiting = useMemo(() => {
    if (reducedMotion || exitKey == null) return undefined;

    // `resolveExitKeyframes` has checked the shape; Reanimated's own type
    // wants `from` / `to` spelled out, which data cannot promise statically.
    const keyframes = resolveExitKeyframes(
      exitKey.startsWith('{') ? JSON.parse(exitKey) : exitKey,
    ) as unknown as ConstructorParameters<typeof Keyframe>[0];
    const keyframe = new Keyframe(keyframes).duration(
      exitDuration ?? EXIT_ANIMATION_DURATION,
    );

    return exitDelay ? keyframe.delay(exitDelay) : keyframe;
  }, [exitDelay, exitDuration, exitKey, reducedMotion]);

  const layout = useMemo(
    () =>
      reducedMotion || !layoutDuration
        ? undefined
        : LinearTransition.duration(layoutDuration),
    [layoutDuration, reducedMotion],
  );

  return { exiting, layout };
};

export default useHostMotion;
