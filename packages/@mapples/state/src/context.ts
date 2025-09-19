import { createContext } from 'react';

import { StateContextType } from './types';

const StateContext = createContext<StateContextType>({
  value: {},
});

export const StateContextProvider = StateContext.Provider;

export default StateContext;
