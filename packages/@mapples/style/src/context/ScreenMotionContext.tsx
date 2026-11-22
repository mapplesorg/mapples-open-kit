import { createContext } from 'react';

import { ScreenMotionStore } from '../types';

/**
 * The motion store of the screen an element is on, or `null` outside a
 * `ScreenMotionProvider` (a design canvas, a component rendered on its own):
 * there nothing scrolls a bar away and nothing replays on focus.
 */
const ScreenMotionContext = createContext<ScreenMotionStore | null>(null);

export default ScreenMotionContext;
