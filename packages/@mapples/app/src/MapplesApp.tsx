import { FC, PropsWithChildren, JSX } from 'react';

import { AnyObject, RenderProvider } from '@mapples/render';
import { StyleContextType, StyleProvider, Styler } from '@mapples/style';
import { Components } from '@mapples/ui';
import { useFonts } from 'expo-font';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import assetsConfig from 'mapples::assets';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import styleConfig from 'mapples::style';

import { remapFonts } from './utils';

export interface MapplesAppProps {
  style?: StyleContextType;
  assets?: AnyObject;
  showFontLoadingIndicator?: boolean;
  FontLoadingIndicator?: JSX.Element;
}

const MapplesApp: FC<PropsWithChildren<MapplesAppProps>> = ({
  children,
  style,
  assets,
  showFontLoadingIndicator,
  FontLoadingIndicator,
}) => {
  const [loaded] = useFonts(remapFonts(assets || assetsConfig));

  if (!loaded && showFontLoadingIndicator) {
    return FontLoadingIndicator || null;
  }

  return (
    <StyleProvider style={Styler.init(style || styleConfig)}>
      <RenderProvider components={Components} assets={assets || assetsConfig}>
        {children}
      </RenderProvider>
    </StyleProvider>
  );
};

export default MapplesApp;
