import { Styler } from '@mapples/style';

import { LOTTIE_ANIMATION_HEIGHT, LottieAnimationProps } from './types';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    height: LOTTIE_ANIMATION_HEIGHT,
    overflow: 'hidden',
  },
  // The native player fills the box.
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

/** The played frame range, or null for the whole animation. */
export const readSegment = ({
  startFrame,
  endFrame,
}: Pick<LottieAnimationProps, 'startFrame' | 'endFrame'>):
  | [number, number]
  | null => {
  if (startFrame === undefined && endFrame === undefined) return null;
  if (
    typeof startFrame !== 'number' ||
    typeof endFrame !== 'number' ||
    !(startFrame >= 0) ||
    !(endFrame > startFrame)
  ) {
    throw new Error(
      `LottieAnimation: startFrame (${String(startFrame)}) and endFrame (${String(endFrame)}) must be set together, with 0 ≤ startFrame < endFrame`,
    );
  }
  return [startFrame, endFrame];
};

export const readSpeed = (speed: unknown): number => {
  if (!(typeof speed === 'number' && speed > 0)) {
    throw new Error(
      `LottieAnimation: speed (${String(speed)}) must be above 0`,
    );
  }
  return speed;
};

/** A `seek` action's progress, 0 to 1. */
export const readProgress = (progress: unknown): number => {
  if (!(typeof progress === 'number' && progress >= 0 && progress <= 1)) {
    throw new Error(
      `LottieAnimation: seek progress (${String(progress)}) must be between 0 and 1`,
    );
  }
  return progress;
};

/** The message both platforms throw when the Lottie runtime is not installed. */
export const missingRuntimeMessage = (dependency: string, cause: unknown) =>
  `LottieAnimation: ${dependency} could not be loaded (the "Lottie" package). ` +
  'Creator-first app: enable it in Project settings → Packages. ' +
  'Code-first app: run `mapples sync` (it adds the package to package.json), ' +
  'then the install command the sync names; rebuild the native app afterwards. ' +
  `Cause: ${String(cause)}`;
