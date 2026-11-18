import { createContext } from 'react';

/**
 * How much later the animations below start because of the
 * `animationStagger` of the elements above, in milliseconds. `0` outside any
 * staggered parent.
 */
const MotionStaggerContext = createContext(0);

export default MotionStaggerContext;
