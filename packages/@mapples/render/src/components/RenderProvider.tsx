import { FC, PropsWithChildren } from 'react';

import { RenderContextProvider } from '../context';
import { RenderContextType } from '../types';

const RenderProvider: FC<PropsWithChildren<RenderContextType>> = ({
  components,
  children,
}) => {
  return (
    <RenderContextProvider value={{ components }}>
      {children}
    </RenderContextProvider>
  );
};

export default RenderProvider;
