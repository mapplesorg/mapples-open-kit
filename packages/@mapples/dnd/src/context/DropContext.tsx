import { createContext } from 'react';

const DropContext = createContext<{ parent: number | null }>({
  parent: null,
});

export const DropContextProvider = DropContext.Provider;

export default DropContext;
