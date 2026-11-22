import { FC, useEffect } from 'react';

import { useActionStore } from '@mapples/action';
import { sendMotionCommand } from '@mapples/style';

import {
  AnimationActionType,
  readAnimationActionData,
} from './animationControl';

/**
 * Passes `mapples:animation` actions on to the elements addressed by the
 * `motionName` of their style: `play` (resume, or start the animation again;
 * with `animation`, a preset played once) and `pause`. Mount it once inside
 * the app's `ActionProvider`, next to the other action handlers.
 *
 * The other commands (`stop`, `seek`, `setInput`, `fireTrigger`) belong to
 * the Lottie and Rive elements, which listen for their own name themselves;
 * they are not forwarded.
 *
 * @example
 * ```tsx
 * <ActionProvider>
 *   <MotionActionHandler />
 *   <Screens />
 * </ActionProvider>
 * ```
 */
const MotionActionHandler: FC = () => {
  const actionStore = useActionStore();

  useEffect(() => {
    const subscription = actionStore.subscribe((action) => {
      if (action.type !== AnimationActionType.Control) return;

      const data = readAnimationActionData(action.payload?.data);
      // A malformed payload is reported by the animation elements' own
      // listener when one is mounted; here it simply addresses nothing.
      if (!data || (data.command !== 'play' && data.command !== 'pause')) {
        return;
      }

      sendMotionCommand({
        target: data.target,
        command: data.command,
        animation: data.animation,
        duration: data.duration,
      });
    });

    return () => subscription.unsubscribe();
  }, [actionStore]);

  return null;
};

export default MotionActionHandler;
