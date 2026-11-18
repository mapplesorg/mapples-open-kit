import { useContext } from 'react';

import MotionEnabledContext from '../context/MotionEnabledContext';

/**
 * Whether motion plays where the caller renders: `true` unless a
 * `MotionProvider` above turned it off. A component that animates by itself
 * (not through its style) checks this next to the OS's reduced-motion
 * setting.
 */
const useMotionEnabled = (): boolean => useContext(MotionEnabledContext);

export default useMotionEnabled;
