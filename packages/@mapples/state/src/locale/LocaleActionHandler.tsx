import { useEffect, useLayoutEffect, useRef } from 'react';

import { useActionStore } from '@mapples/action';

import { useLocaleState } from './context';

export const LocaleActionType = {
  /**
   * Switch the app's locale. `payload.data` is the locale tag itself (a
   * bound value) or `{ locale }`; `{ locale: null }` returns to the
   * device's locale.
   */
  SetLocale: 'mapples:setLocale',
} as const;

/** `payload.data` of a `mapples:setLocale` action. */
export type SetLocaleData = string | { locale: string | null };

/**
 * Bridges the `@mapples/action` store to the locale runtime: applies
 * `mapples:setLocale` actions against the surrounding `LocaleProvider`.
 * Renders nothing. Mount once, inside both `LocaleProvider` and
 * `ActionProvider`.
 */
const LocaleActionHandler = () => {
  const actionStore = useActionStore();
  const localeState = useLocaleState();

  // Read through a ref so the subscription outlives locale changes (see
  // `StateActionHandler` for why resubscribing loses actions).
  const latest = useRef(localeState);
  useLayoutEffect(() => {
    latest.current = localeState;
  }, [localeState]);

  useEffect(() => {
    const subscription = actionStore.subscribe((action) => {
      if (action.type !== LocaleActionType.SetLocale) return;
      const state = latest.current;
      if (!state) return;
      const data = action.payload?.data as SetLocaleData | undefined;
      if (typeof data === 'string') {
        state.setLocale(data);
      } else if (data && 'locale' in data) {
        state.setLocale(data.locale);
      } else {
        console.warn(
          '[@mapples/state] mapples:setLocale needs a locale tag or { locale }',
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [actionStore]);

  return null;
};

export default LocaleActionHandler;
