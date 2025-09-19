import { createContext } from 'react';

import { makeMutable } from 'react-native-reanimated';

import { initialDragCoords, initialOverLayout } from '../constants';
import { Monitor } from '../monitor';
import { DnDContextType } from '../types';

const DnDContext = createContext<DnDContextType<any, any>>({
  monitor: new Monitor({ padding: 10 }),
  isDragging: false,
  sv: makeMutable(initialDragCoords),
  svOverLayout: makeMutable(initialOverLayout),
});

export const DnDContextProvider = DnDContext.Provider;

export default DnDContext;
