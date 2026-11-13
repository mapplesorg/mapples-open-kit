import { useEffect, useLayoutEffect, useRef } from 'react';

import { useActionStore } from '@mapples/action';

/** Action type that controls a `LottieAnimation` or `RiveAnimation` element. */
export const AnimationActionType = {
  /**
   * Control one animation element. `payload.data` is an
   * {@link AnimationActionData}: `target` is the element's `name` prop.
   */
  Control: 'mapples:animation',
} as const;

/**
 * What a `mapples:animation` action may ask for. `play`, `pause` and `stop`
 * (back to the first frame / the state machine's entry state) work on both
 * elements; `seek` is Lottie only; `setInput` and `fireTrigger` are Rive only.
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
  /** The `name` prop of the animation element to control. */
  target: string;
  command: AnimationCommand;
  /** `seek`: where to stand, 0 (first frame) to 1 (last frame). */
  progress?: number;
  /** `setInput` / `fireTrigger`: the state machine input's name. */
  input?: string;
  /** `setInput`: the value to write (boolean or number input). */
  value?: boolean | number;
}

const isCommand = (value: unknown): value is AnimationCommand =>
  (ANIMATION_COMMANDS as readonly unknown[]).includes(value);

const readActionData = (data: unknown): AnimationActionData | null => {
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
      const data = readActionData(action.payload?.data);
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
