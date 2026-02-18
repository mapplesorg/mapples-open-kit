import { DATA_THIS, DOT_SEPARATOR, FN_SEPARATOR } from './constants';

const actionThisRegExp = new RegExp(`^"this(${FN_SEPARATOR}\\d+)?"$`);

/**
 * Tuple for parsed action/context "this" reference: `['this', optionalIndex]`.
 * @public
 */
export type This = ['this', string?];

/**
 * Returns whether the string matches an action "this" reference: `"this"` or `"this::n"`.
 * @param value - String to test (e.g. from config)
 * @returns True if the value is a quoted "this" or "this::n" reference
 * @public
 */
export const isThis = (value?: string) => {
  return actionThisRegExp.test(value || '');
};

/**
 * Returns whether the string is a data-context reference starting with `(this)`.
 * @param value - String to test
 * @returns True if the value starts with DATA_THIS
 * @public
 */
export const isDataThis = (value?: string) => {
  return value?.startsWith(DATA_THIS);
};

/**
 * Strips the `(this)` prefix and splits the rest by dot into path segments.
 * @param value - Full data-this string (e.g. `(this).user.name`)
 * @returns Array of path segments
 * @public
 */
export const parseDataThis = (value: string) => {
  return value.replace(DATA_THIS, '').split(DOT_SEPARATOR);
};

/**
 * Parses a quoted "this" or "this::n" string into a This tuple.
 * @param value - Quoted string (e.g. `"this"` or `"this::2"`)
 * @returns `['this']` or `['this', n]`; if value is falsy returns `['this']`
 * @public
 */
export const parseThis = (value?: string): This => {
  return value ? (value.slice(1, -1).split(FN_SEPARATOR) as This) : ['this'];
};
