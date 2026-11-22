/**
 * @fileoverview The project locales document: the languages an app supports
 * and its translated messages, editable in the Creator and resolved at
 * runtime by the locale provider (`@mapples/state`).
 *
 * Persisted as one opaque row per project (mirroring the variables
 * document); validated client-side by `validateLocalesDocument`. A project
 * without the document is single-language: its texts are the literals on
 * the canvas and nothing here applies.
 *
 * Messages are addressed from bindings under the `t.` namespace
 * (`t.home.title`); the active locale is readable under `locale.`
 * (`locale.current`, `locale.isRTL`).
 */

/** The namespace prefix translated messages resolve under in bindings. */
export const MESSAGES_NAMESPACE = 't';

/** The namespace prefix the active locale resolves under in bindings. */
export const LOCALE_NAMESPACE = 'locale';

/**
 * A message key: dot-separated identifier segments (`home.title`), so it
 * composes into a binding path under `t.`.
 */
export const MESSAGE_KEY_PATTERN =
  /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/;

/**
 * A locale tag in BCP 47 shape: language, optional script, optional region
 * (`en`, `en-US`, `zh-Hant-TW`, `es-419`).
 */
export const LOCALE_TAG_PATTERN =
  /^[a-z]{2,3}(-[A-Z][a-z]{3})?(-([A-Z]{2}|[0-9]{3}))?$/;

/** The messages of one locale, keyed by message key. */
export type LocaleMessages = Record<string, string>;

export interface LocalesDocument {
  version: 1;
  /** The locale used when the device's is not supported; one of `locales`. */
  defaultLocale: string;
  /** Every supported locale tag, the default included, in display order. */
  locales: string[];
  /**
   * Message templates per locale tag. A key missing from a locale falls
   * back to the default locale's template at runtime.
   */
  messages: Record<string, LocaleMessages>;
}

/** The locale a project starts with when its first locale is declared. */
export const INITIAL_LOCALE = 'en-US';

/** An empty document, used before a project has declared any locale. */
export const emptyLocalesDocument = (): LocalesDocument => ({
  version: 1,
  defaultLocale: INITIAL_LOCALE,
  locales: [INITIAL_LOCALE],
  messages: {},
});

/** The binding path a message is read at, e.g. `t.home.title`. */
export const messageStatePath = (key: string): string =>
  `${MESSAGES_NAMESPACE}.${key}`;

/** The language subtag of a locale tag (`en-US` → `en`). */
export const localeLanguage = (locale: string): string =>
  locale.split('-')[0].toLowerCase();

/** Language subtags written right-to-left. */
const RTL_LANGUAGES: ReadonlySet<string> = new Set([
  'ar',
  'he',
  'fa',
  'ur',
  'ps',
  'sd',
  'ug',
  'yi',
  'dv',
  'ckb',
]);

/** Whether a locale's script runs right-to-left. */
export const isRtlLocale = (locale: string): boolean =>
  RTL_LANGUAGES.has(localeLanguage(locale));

/**
 * Pick the supported locale closest to what the device prefers: an exact
 * tag, else the same language (`en-GB` → `en-US`), walking `preferred` in
 * order; the default when none matches.
 */
export const matchLocale = (
  preferred: readonly string[],
  document: Pick<LocalesDocument, 'defaultLocale' | 'locales'>,
): string => {
  const supported = document.locales;
  for (const wanted of preferred) {
    const tag = wanted.replace(/_/g, '-');
    const exact = supported.find(
      (locale) => locale.toLowerCase() === tag.toLowerCase(),
    );
    if (exact) return exact;
    const language = localeLanguage(tag);
    const sameLanguage = supported.find(
      (locale) => localeLanguage(locale) === language,
    );
    if (sameLanguage) return sameLanguage;
  }
  return document.defaultLocale;
};

/**
 * The template a key resolves to in a locale: the locale's own, else the
 * default locale's; `undefined` when neither has it.
 */
export const resolveMessage = (
  document: LocalesDocument,
  locale: string,
  key: string,
): string | undefined =>
  document.messages[locale]?.[key] ??
  document.messages[document.defaultLocale]?.[key];

/** Every message key used by any locale, sorted. */
export const messageKeys = (document: LocalesDocument): string[] => {
  const keys = new Set<string>();
  for (const messages of Object.values(document.messages)) {
    for (const key of Object.keys(messages)) keys.add(key);
  }
  return [...keys].sort();
};

/** The keys a locale has no (or an empty) template for. */
export const missingMessageKeys = (
  document: LocalesDocument,
  locale: string,
): string[] =>
  messageKeys(document).filter((key) => !document.messages[locale]?.[key]);
