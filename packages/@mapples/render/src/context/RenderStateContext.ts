import { createContext } from 'react';

import { StateCondition } from '../types';

const RenderStateContext = createContext<
  Record<string, StateCondition> | undefined
>(undefined);

export const RenderStateContextProvider = RenderStateContext.Provider;

export default RenderStateContext;
