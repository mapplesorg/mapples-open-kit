import { useLocaleState } from '@mapples/state';
import { I18nManager } from 'react-native';

/**
 * Whether the layout runs right-to-left: the active locale's direction in
 * a multilingual app (it changes at runtime), else the platform's own.
 * Components that mirror a glyph or a gesture read this.
 */
const useIsRTL = (): boolean => {
  const locale = useLocaleState()?.value;
  return locale && locale.supported.length > 0
    ? locale.isRTL
    : I18nManager.isRTL;
};

export default useIsRTL;
