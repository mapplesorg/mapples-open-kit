import { FC, PropsWithChildren, useEffect } from 'react';

import { useLocaleState } from '@mapples/state';
import { I18nManager, Platform, StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  root: { flex: 1 },
  ltr: { direction: 'ltr' },
  rtl: { direction: 'rtl' },
});

/**
 * Lays the app out in the active locale's direction. A single-language
 * project (no locales document) keeps the platform's own direction.
 *
 * The `direction` style mirrors the subtree at once. Android also takes the
 * direction from `I18nManager`, which only applies on the next launch: the
 * choice is recorded there too, so a restart lands in the right direction.
 */
const LocaleDirection: FC<PropsWithChildren> = ({ children }) => {
  const locale = useLocaleState()?.value;
  const isRTL =
    locale && locale.supported.length > 0 ? locale.isRTL : undefined;

  useEffect(() => {
    if (Platform.OS !== 'android' || isRTL === undefined) return;
    if (I18nManager.isRTL === isRTL) return;
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }, [isRTL]);

  return (
    <View
      style={[
        styles.root,
        isRTL === undefined ? undefined : isRTL ? styles.rtl : styles.ltr,
      ]}
    >
      {children}
    </View>
  );
};

export default LocaleDirection;
