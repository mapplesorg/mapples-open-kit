import { FC, PropsWithChildren } from 'react';

import { AnyObject, RenderProvider } from '@mapples/render';
import { StyleContextType, StyleProvider, Styler } from '@mapples/style';
import { Components } from '@mapples/ui';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import assetsConfig from 'mapples::assets';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import styleConfig from 'mapples::style';

export interface MapplesAppProps {
  style?: StyleContextType;
  assets?: AnyObject;
}

const MapplesApp: FC<PropsWithChildren<MapplesAppProps>> = ({
  children,
  style,
  assets,
}) => {
  return (
    <StyleProvider style={Styler.init(style || styleConfig)}>
      <RenderProvider components={Components} assets={assets || assetsConfig}>
        {children}
      </RenderProvider>
    </StyleProvider>
  );
};

export default MapplesApp;
