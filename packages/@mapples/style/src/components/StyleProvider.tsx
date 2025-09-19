import { FC, PropsWithChildren } from 'react';

import { StyleContextProvider } from '../context';
import { StyleContextType } from '../types';

import ResponsiveStyleProvider from './ResponsiveStyleProvider';

export interface StyleProviderProps {
  style: StyleContextType;
}

const StyleProvider: FC<PropsWithChildren<StyleProviderProps>> = ({
  style,
  children,
}) => {
  return (
    <StyleContextProvider value={style}>
      <ResponsiveStyleProvider>{children}</ResponsiveStyleProvider>
    </StyleContextProvider>
  );
};

export default StyleProvider;
