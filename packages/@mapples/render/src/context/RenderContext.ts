import { createContext } from 'react';

import { RenderContextType } from '../types';

const RenderContext = createContext<RenderContextType>({
  components: {},
});

export const RenderContextProvider = RenderContext.Provider;

export default RenderContext;
