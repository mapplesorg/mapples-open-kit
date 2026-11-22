import { useEffect, useLayoutEffect, useRef } from 'react';

import { useActionStore } from '@mapples/action';

/**
 * Action type that controls an animation: a `LottieAnimation` or
 * `RiveAnimation` element, or the style animation of any element.
 */
export const AnimationActionType = {
  /**
   * Control one animation. `payload.data` is an {@link AnimationActionData}:
   * `target` is the `name` prop of a Lottie / Rive element, or the
   * `motionName` in the style of any other element.
   */
  Control: 'mapples:animation',
} as const;

/**
 * What a `mapples:animation` action may ask for. `play`, `pause` and `stop`
 * (back to the first frame / the state machine's entry state) work on the
 * Lottie and Rive elements; `seek` is Lottie only; `setInput` and
 * `fireTrigger` are Rive only.
 *
 * An element addressed by the `motionName` of its style takes `play` (resume
 * when paused, otherwise play the animation again from its start; with
 * `animation`, play that preset once) and `pause`.
 */
export const ANIMATION_COMMANDS = [
  'play',
  'pause',
  'stop',
  'seek',
  'setInput',
  'fireTrigger',
] as const;

export type AnimationCommand = (typeof ANIMATION_COMMANDS)[number];

/** `payload.data` of a `mapples:animation` action. */
export interface AnimationActionData {
  /**
   * The `name` prop of the Lottie / Rive element to control, or the
   * `motionName` in the style of any other element.
   */
  target: string;
  command: AnimationCommand;
  /**
   * `play` on an element addressed by `motionName`: a preset of
   * `ANIMATION_PRESETS` (`@mapples/style`) to play once in place of the
   * element's own animation, e.g. `shake` when a submit fails.
   */
  animation?: string;
  /** Length of that one-off animation: `'400ms'`, `'0.4s'` or milliseconds. */
  duration?: string | number;
  /** `seek`: where to stand, 0 (first frame) to 1 (last frame). */
  progress?: number;
  /** `setInput` / `fireTrigger`: the state machine input's name. */
  input?: string;
  /** `setInput`: the value to write (boolean or number input). */
  value?: boolean | number;
}

const isCommand = (value: unknown): value is AnimationCommand =>
  (ANIMATION_COMMANDS as readonly unknown[]).includes(value);

/**
 * A `mapples:animation` payload read strictly: `null` unless it has a
 * `target` and one of {@link ANIMATION_COMMANDS}.
 */
export const readAnimationActionData = (
  data: unknown,
): AnimationActionData | null => {
  if (typeof data !== 'object' || data === null) return null;
  const { target, command } = data as Record<string, unknown>;
  if (typeof target !== 'string' || !isCommand(command)) return null;
  return data as AnimationActionData;
};

/**
 * Subscribes an animation element to `mapples:animation` actions addressed
 * to its `name`. An element without a name receives nothing. The handler is
 * read through a ref, so the subscription outlives re-renders.
 */
export const useAnimationCommands = (
  name: string | undefined,
  handle: (data: AnimationActionData) => void,
): void => {
  const actionStore = useActionStore();

  const latest = useRef(handle);
  useLayoutEffect(() => {
    latest.current = handle;
  });

  useEffect(() => {
    if (!name) return undefined;
    const subscription = actionStore.subscribe((action) => {
      if (action.type !== AnimationActionType.Control) return;
      const data = readAnimationActionData(action.payload?.data);
      if (!data) {
        console.warn(
          '[@mapples/components] mapples:animation needs { target, command }',
        );
        return;
      }
      if (data.target !== name) return;
      latest.current(data);
    });
    return () => subscription.unsubscribe();
  }, [actionStore, name]);
};
