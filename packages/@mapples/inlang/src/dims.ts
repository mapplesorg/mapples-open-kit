import { FN_SEPARATOR } from './constants';

const dimRegExp = new RegExp(`^(w|h|width|height)(${FN_SEPARATOR}\\d+)?$`);

/** The canonical dimension axis: either `'width'` or `'height'`. */
export type DimType = 'width' | 'height';

/**
 * A parsed dimension tuple: `[axis, fraction]`.
 *
 * `fraction` is a value in the range `[0, 1]` representing the percentage of
 * the parent container's corresponding axis, or `1` when no percentage is
 * specified.
 */
export type Dims = [DimType, number];

/**
 * The string tokens recognised as dimension axis shorthands in inline-lang
 * expressions (`'w'` and `'h'` are short forms; `'width'`/`'height'` are the
 * long forms).
 */
export type DimsString = 'w' | 'h' | 'width' | 'height';

const mapDimsType = {
  w: 'width',
  h: 'height',
  width: 'width',
  height: 'height',
} as const;

/**
 * Parses a dimension string into a `Dims` tuple.
 *
 * Dimension strings follow the pattern `<axis>[::percentage]`, where `axis` is
 * one of `w`, `h`, `width`, or `height`, and the optional `percentage` suffix
 * (separated by `::`) is an integer representing a percentage (e.g. `"w::50"`
 * yields `['width', 0.5]`). When no percentage is provided the fraction
 * defaults to `1`.
 *
 * Returns `null` for any string that does not match the expected pattern.
 *
 * @param dim - The dimension string to parse (e.g. `"w"`, `"height::75"`).
 * @returns A `[DimType, fraction]` tuple, or `null` if the string is invalid.
 *
 * @example
 * ```ts
 * parseDims('w');        // ['width', 1]
 * parseDims('h::50');    // ['height', 0.5]
 * parseDims('width::100'); // ['width', 1]
 * parseDims('invalid'); // null
 * ```
 *
 * @public
 */
export const parseDims = (dim: string): Dims | null => {
  if (dimRegExp.test(dim)) {
    const [type, percent] = dim.split(FN_SEPARATOR);
    const value = parseInt(percent || '', 10);

    return [mapDimsType[type as DimsString], !isNaN(value) ? value / 100 : 1];
  }

  return null;
};
