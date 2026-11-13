import { FC, PropsWithChildren } from 'react';

import { StyleSheet, View, ViewProps } from 'react-native';

import { useLocaleState } from './context';
import { LocaleDirectionProps } from './types';

const styles = StyleSheet.create({ fill: { flex: 1 } });

/** react-native-web's View takes the document direction as a `dir` prop. */
type WebViewProps = ViewProps & { dir?: 'ltr' | 'rtl'; lang?: string };
const WebView = View as unknown as FC<PropsWithChildren<WebViewProps>>;

/**
 * Lays its subtree out in the active locale's direction (`dir` on web). A
 * single-language project (no locales document) keeps the page's own.
 */
const LocaleDirection: FC<PropsWithChildren<LocaleDirectionProps>> = ({
  children,
  fill = true,
  style,
}) => {
  const locale = useLocaleState()?.value;
  const multilingual = !!locale && locale.supported.length > 0;

  return (
    <WebView
      style={[fill ? styles.fill : undefined, style]}
      dir={multilingual ? locale.direction : undefined}
      lang={multilingual ? locale.current : undefined}
    >
      {children}
    </WebView>
  );
};

export default LocaleDirection;
