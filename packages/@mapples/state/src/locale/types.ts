import { LocalesDocument, MessagePart } from '@mapples/types';
import { StyleProp, ViewStyle } from 'react-native';

import { VariablesStorage } from '../writable/types';

/** What bindings read under the `locale.` namespace. */
export interface LocaleValue {
  /** The active locale tag (`uk-UA`). */
  current: string;
  /** Its language subtag (`uk`). */
  language: string;
  /** `'rtl'` for right-to-left scripts. */
  direction: 'ltr' | 'rtl';
  isRTL: boolean;
  /** The project's default locale; the active one when it declares none. */
  default: string;
  /** The project's supported locales; empty for a single-language project. */
  supported: string[];
}

export interface LocaleContextType {
  value: LocaleValue;
  /** The project's locales document; `null` for a single-language project. */
  document: LocalesDocument | null;
  /**
   * Switch the active locale. `null` goes back to the device's (closest
   * supported, else the default). An unsupported tag warns and returns
   * `false`.
   */
  setLocale: (locale: string | null) => boolean;
  /**
   * The parsed template of a message key in the active locale (falling back
   * to the default locale's); `undefined` for an unknown key.
   */
  message: (key: string) => MessagePart[] | undefined;
}

export interface LocaleDirectionProps {
  /** Whether the wrapper fills its parent (`flex: 1`). Default `true`. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface LocaleProviderProps {
  /** The project's locales document; absent → single-language. */
  document?: LocalesDocument | null;
  /**
   * Start a fresh locale session over the surrounding provider's project:
   * its document, starting in its active locale. A switch made inside stays
   * inside (a Play session over the editor's preview locale).
   */
  inherit?: boolean;
  /**
   * Pins the active locale (the Creator's preview switcher). While set,
   * `setLocale` still updates the provider's own choice, which shows again
   * once the pin is lifted.
   */
  locale?: string | null;
  /**
   * What the device prefers, most wanted first. Defaults to the platform's
   * own answer (`deviceLocales()`).
   */
  preferredLocales?: readonly string[];
  /** Keeps the user's choice across launches (same adapter as variables). */
  storage?: VariablesStorage;
}
