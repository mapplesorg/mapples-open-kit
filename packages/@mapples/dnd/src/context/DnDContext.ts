import { createContext } from 'react';

import { makeMutable } from 'react-native-reanimated';

import { initialDragCoords, initialOverLayout } from '../constants';
import { Monitor } from '../monitor';
import { DnDContextType } from '../types';

/**
 * React context for drag and drop functionality.
 * Provides access to the monitor, drag state, and shared values throughout the component tree.
 * @public
 */
const DnDContext = createContext<DnDContextType<any, any>>({
  monitor: new Monitor({ padding: 10 }),
  isDragging: false,
  sv: makeMutable(initialDragCoords),
  svOverLayout: makeMutable(initialOverLayout),
});

/**
 * Provider component for the drag and drop context.
 * @public
 */
export const DnDContextProvider = DnDContext.Provider;

export default DnDContext;
