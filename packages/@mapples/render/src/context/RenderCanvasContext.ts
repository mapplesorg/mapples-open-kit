import { createContext } from 'react';

import { RenderContextType } from '../types';

const RenderCanvasContext = createContext<RenderContextType>({
  components: {},
});

export const RenderCanvasContextProvider = RenderCanvasContext.Provider;

export default RenderCanvasContext;
