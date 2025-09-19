import { FC, PropsWithChildren } from 'react';

import { DropContextProvider } from '../context';
import { DropAreaProps } from '../types';

const DropArea: FC<PropsWithChildren<DropAreaProps>> = ({
  children,
  forId,
}) => {
  return (
    <DropContextProvider value={{ parent: forId }}>
      {children}
    </DropContextProvider>
  );
};

export default DropArea;
