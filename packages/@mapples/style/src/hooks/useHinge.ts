import { useContext } from 'react';

import { HingeContext } from '../context';
import { Hinge } from '../types';

/**
 * Hook to read the hinge of a foldable device: its angle and whether it is
 * closed, partially open or fully open. `null` on a device with no hinge, and
 * wherever no `HingeProvider` supplies one.
 *
 * Use it for interactions and effects. Layout follows the window size, which
 * already changes when the device folds — see `useResponsive`.
 *
 * @example
 * ```tsx
 * const Player = () => {
 *   const hinge = useHinge();
 *   const tabletop = hinge?.status === 'partiallyOpen';
 *
 *   return <Video controlsBelow={tabletop} />;
 * };
 * ```
 */
const useHinge = (): Hinge | null => useContext(HingeContext);

export default useHinge;
