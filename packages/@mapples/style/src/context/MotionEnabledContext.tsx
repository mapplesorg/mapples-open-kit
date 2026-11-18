import { createContext } from 'react';

/**
 * Whether the elements below play their motion. `true` unless a
 * `MotionProvider` says otherwise: an app always animates; an editor shows
 * designs still until the author asks to see them move.
 */
const MotionEnabledContext = createContext(true);

export default MotionEnabledContext;
