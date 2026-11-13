import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  isRtlLocale,
  localeLanguage,
  matchLocale,
  messageKeys,
  MessagePart,
  parseMessage,
  resolveMessage,
} from '@mapples/types';

import { LocaleContextProvider, useLocaleState } from './context';
import { deviceLocales } from './deviceLocales';
import { LocaleContextType, LocaleProviderProps, LocaleValue } from './types';

/** The storage key the chosen locale is kept under. */
export const LOCALE_STORAGE_KEY = 'mapples.locale';

/**
 * The active locale of an app and its translated messages, exposed to
 * bindings under `locale.*` and `t.*`.
 *
 * Resolution order: the `locale` prop (a pin), the user's choice
 * (`setLocale`, restored from `storage`), the device's preference matched
 * to the supported locales, the document's default. A project without a
 * locales document is single-language: the device locale is active (so
 * number and date formats still follow it) and no message resolves.
 */
const LocaleProvider: FC<PropsWithChildren<LocaleProviderProps>> = ({
  children,
  document: ownDocument,
  inherit,
  locale: pinned,
  preferredLocales,
  storage,
}) => {
  const parent = useLocaleState();
  const document = (inherit ? parent?.document : ownDocument) ?? null;
  const [chosen, setChosen] = useState<string | null>(
    inherit && parent ? parent.value.current : null,
  );

  useEffect(() => {
    if (!storage) return;
    let cancelled = false;
    // A storage that fails still lets the app start, on the device locale;
    // its rejection is not swallowed, it surfaces as unhandled.
    void storage.get(LOCALE_STORAGE_KEY).then((stored) => {
      if (!cancelled && typeof stored === 'string') setChosen(stored);
    });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const preferred = useMemo(
    () => preferredLocales ?? deviceLocales(),
    [preferredLocales],
  );

  const active = useMemo(() => {
    if (!document) return pinned ?? chosen ?? preferred[0] ?? 'en-US';
    // A pin or a stored choice the project no longer supports is ignored.
    for (const wanted of [pinned, chosen]) {
      if (wanted && document.locales.includes(wanted)) return wanted;
    }
    return matchLocale(preferred, document);
  }, [document, pinned, chosen, preferred]);

  const value = useMemo<LocaleValue>(() => {
    const isRTL = isRtlLocale(active);
    return {
      current: active,
      language: localeLanguage(active),
      direction: isRTL ? 'rtl' : 'ltr',
      isRTL,
      default: document?.defaultLocale ?? active,
      supported: document?.locales ?? [],
    };
  }, [active, document]);

  const setLocale = useCallback<LocaleContextType['setLocale']>(
    (next) => {
      if (next !== null && document && !document.locales.includes(next)) {
        console.warn(
          `[@mapples/state] setLocale("${next}"): not a supported locale (${document.locales.join(', ')})`,
        );
        return false;
      }
      setChosen(next);
      if (storage) void storage.set(LOCALE_STORAGE_KEY, next);
      return true;
    },
    [document, storage],
  );

  // Every template of the active locale, parsed once per document and
  // locale. A template that does not parse throws here — the Creator
  // validates them on every edit.
  const parsed = useMemo(() => {
    const table: Record<string, MessagePart[]> = {};
    if (!document) return table;
    for (const key of messageKeys(document)) {
      const template = resolveMessage(document, active, key);
      if (template !== undefined) table[key] = parseMessage(template);
    }
    return table;
  }, [document, active]);

  const message = useCallback<LocaleContextType['message']>(
    (key) => (Object.hasOwn(parsed, key) ? parsed[key] : undefined),
    [parsed],
  );

  const context = useMemo<LocaleContextType>(
    () => ({ value, document, setLocale, message }),
    [value, document, setLocale, message],
  );

  return (
    <LocaleContextProvider value={context}>{children}</LocaleContextProvider>
  );
};

export default LocaleProvider;
