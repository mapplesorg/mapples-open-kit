import {
  LOCALE_TAG_PATTERN,
  LocalesDocument,
  MESSAGE_KEY_PATTERN,
} from './locales';
import { MessageSyntaxError, parseMessage } from './messageFormat';

/**
 * Codes for the invariants enforced by {@link validateLocalesDocument}.
 *
 * - `LOCALE_INVALID` — a tag does not match {@link LOCALE_TAG_PATTERN}.
 * - `LOCALE_DUPLICATE` — a tag is listed more than once.
 * - `DEFAULT_NOT_SUPPORTED` — `defaultLocale` is not in `locales`.
 * - `MESSAGES_UNKNOWN_LOCALE` — messages exist for an undeclared locale.
 * - `KEY_INVALID` — a key does not match {@link MESSAGE_KEY_PATTERN}.
 * - `MESSAGE_SYNTAX` — a template does not parse.
 */
export type LocalesValidationCode =
  | 'LOCALE_INVALID'
  | 'LOCALE_DUPLICATE'
  | 'DEFAULT_NOT_SUPPORTED'
  | 'MESSAGES_UNKNOWN_LOCALE'
  | 'KEY_INVALID'
  | 'MESSAGE_SYNTAX';

export interface LocalesValidationError {
  code: LocalesValidationCode;
  message: string;
  locale?: string;
  key?: string;
}

export interface LocalesValidationResult {
  valid: boolean;
  errors: LocalesValidationError[];
}

/**
 * Validate the structural invariants of a {@link LocalesDocument}. Collects
 * every violation (same shape as `validateVariablesDocument`).
 */
export const validateLocalesDocument = (
  document: LocalesDocument,
): LocalesValidationResult => {
  const errors: LocalesValidationError[] = [];
  const seen = new Set<string>();

  for (const locale of document.locales) {
    if (!LOCALE_TAG_PATTERN.test(locale)) {
      errors.push({
        code: 'LOCALE_INVALID',
        message: `Locale "${locale}" is not a valid tag (expected e.g. "en-US")`,
        locale,
      });
    }
    if (seen.has(locale)) {
      errors.push({
        code: 'LOCALE_DUPLICATE',
        message: `Locale "${locale}" is listed more than once`,
        locale,
      });
    }
    seen.add(locale);
  }

  if (!seen.has(document.defaultLocale)) {
    errors.push({
      code: 'DEFAULT_NOT_SUPPORTED',
      message: `Default locale "${document.defaultLocale}" is not one of the supported locales`,
      locale: document.defaultLocale,
    });
  }

  for (const [locale, messages] of Object.entries(document.messages)) {
    if (!seen.has(locale)) {
      errors.push({
        code: 'MESSAGES_UNKNOWN_LOCALE',
        message: `Messages exist for "${locale}", which is not a supported locale`,
        locale,
      });
    }
    for (const [key, template] of Object.entries(messages)) {
      if (!MESSAGE_KEY_PATTERN.test(key)) {
        errors.push({
          code: 'KEY_INVALID',
          message: `Message key "${key}" must be dot-separated names (e.g. "home.title")`,
          locale,
          key,
        });
      }
      try {
        parseMessage(template);
      } catch (error) {
        if (!(error instanceof MessageSyntaxError)) throw error;
        errors.push({
          code: 'MESSAGE_SYNTAX',
          message: `Message "${key}" (${locale}): ${error.message}`,
          locale,
          key,
        });
      }
    }
  }

  return { valid: errors.length === 0, errors };
};
