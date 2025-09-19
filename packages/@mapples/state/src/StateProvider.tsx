import { FC, PropsWithChildren } from 'react';

import { StateContextProvider } from './context';
import { StateContextType } from './types';

const StateProvider: FC<PropsWithChildren & StateContextType> = ({
  children,
  value,
}) => {
  return (
    <StateContextProvider value={{ value }}>{children}</StateContextProvider>
  );
};

export default StateProvider;
