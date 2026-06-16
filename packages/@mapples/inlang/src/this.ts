import { DATA_THIS, DOT_SEPARATOR, FN_SEPARATOR } from './constants';

const actionThisRegExp = new RegExp(`^"this(${FN_SEPARATOR}\\d+)?"$`);

/**
 * Parsed representation of a `this` reference in an inline-lang expression.
 *
 * The first element is always `'this'`. The optional second element is a
 * numeric index string when the reference targets a specific iteration item
 * (e.g. `"this::0"` → `['this', '0']`).
 */
export type This = ['this', string?];

/**
 * Returns `true` when `value` is a quoted `this` reference string.
 *
 * Matches the literal value `"this"` as well as indexed variants such as
 * `"this::0"`.
 *
 * @param value - The string to test.
 * @returns `true` if `value` is a `this` reference, `false` otherwise.
 *
 * @example
 * ```ts
 * isThis('"this"');    // true
 * isThis('"this::0"'); // true
 * isThis('other');     // false
 * ```
 *
 * @public
 */
export const isThis = (value?: string) => {
  return actionThisRegExp.test(value || '');
};

/**
 * Returns `true` when `value` begins with the `(this)` data-reference prefix.
 *
 * @param value - The string to test.
 * @returns `true` if `value` is a `(this)` data reference, `false` otherwise.
 *
 * @example
 * ```ts
 * isDataThis('(this).name'); // true
 * isDataThis('other');       // false
 * ```
 *
 * @public
 */
export const isDataThis = (value?: string) => {
  return value?.startsWith(DATA_THIS);
};

/**
 * Strips the `(this)` prefix from a data-reference string and splits the
 * remaining dot-notation path into an array of property segments.
 *
 * @param value - A `(this)`-prefixed data-reference string (e.g. `"(this).user.name"`).
 * @returns An array of path segments after the `(this)` prefix (e.g. `['', 'user', 'name']`).
 *
 * @example
 * ```ts
 * parseDataThis('(this).user.name'); // ['', 'user', 'name']
 * parseDataThis('(this)');           // ['']
 * ```
 *
 * @public
 */
export const parseDataThis = (value: string) => {
  return value.replace(DATA_THIS, '').split(DOT_SEPARATOR);
};

/**
 * Parses a quoted `this` reference string into a `This` tuple.
 *
 * Strips the surrounding quotes and splits on `::` to separate the `'this'`
 * keyword from an optional index. When `value` is `undefined` or empty,
 * returns the bare `['this']` tuple.
 *
 * @param value - An optional quoted `this` reference string (e.g. `'"this::0"'`).
 * @returns A `This` tuple representing the reference.
 *
 * @example
 * ```ts
 * parseThis('"this"');    // ['this']
 * parseThis('"this::0"'); // ['this', '0']
 * parseThis(undefined);   // ['this']
 * ```
 *
 * @public
 */
export const parseThis = (value?: string): This => {
  return value ? (value.slice(1, -1).split(FN_SEPARATOR) as This) : ['this'];
};
