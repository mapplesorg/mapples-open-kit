import { I18nManager, Platform } from 'react-native';

/**
 * The locales the device prefers, most wanted first: the browser's language
 * list on web, the system locale on native.
 */
export const deviceLocales = (): string[] => {
  if (Platform.OS === 'web') return [...navigator.languages];
  const { localeIdentifier } = I18nManager.getConstants();
  if (localeIdentifier) {
    // iOS reports `en_US`, and `en_US@calendar=…` for a customised region.
    return [localeIdentifier.split('@')[0].replace(/_/g, '-')];
  }
  return [new Intl.DateTimeFormat().resolvedOptions().locale];
};
