import { FC, PropsWithChildren } from 'react';

import MotionEnabledContext from '../context/MotionEnabledContext';

/** Props for {@link MotionProvider}. */
export interface MotionProviderProps {
  /** Whether the elements inside play their transitions and animations. */
  enabled: boolean;
}

/**
 * Turns the motion of everything inside on or off. Off, a style's motion
 * keys are dropped exactly as with the OS's reduced-motion setting: each
 * element shows its end state and nothing moves, loops, or animates out.
 *
 * An app needs none: motion is on by default. A design surface wraps its
 * screens in `<MotionProvider enabled={false}>` so designs stand still, and a
 * preview that should run wraps itself in `<MotionProvider enabled>`.
 *
 * @example
 * ```tsx
 * <MotionProvider enabled={showMotion}>
 *   <Screen />
 * </MotionProvider>
 * ```
 */
const MotionProvider: FC<PropsWithChildren<MotionProviderProps>> = ({
  enabled,
  children,
}) => (
  <MotionEnabledContext.Provider value={enabled}>
    {children}
  </MotionEnabledContext.Provider>
);

export default MotionProvider;
