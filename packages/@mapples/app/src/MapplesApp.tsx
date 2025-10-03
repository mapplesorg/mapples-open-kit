import { FC, PropsWithChildren } from 'react';

import { RenderProvider } from '@mapples/render';
import { StyleProvider, Styler } from '@mapples/style';
import { Components } from '@mapples/ui';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import assets from 'mapples::assets';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import style from 'mapples::style';

const MapplesApp: FC<PropsWithChildren> = ({ children }) => {
  return (
    <StyleProvider style={Styler.init()}>
      <RenderProvider components={Components} assets={{}}>
        {children}
      </RenderProvider>
    </StyleProvider>
  );
};

export default MapplesApp;
