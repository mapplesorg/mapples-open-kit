import { FN_SEPARATOR } from './constants';

const dimRegExp = new RegExp(`^"(w|h|width|height)(${FN_SEPARATOR}\\d+)?"$`);

/** Dimension axis: width or height. @public */
export type DimType = 'width' | 'height';

/** Parsed dimension: [axis, multiplier 0..1]. @public */
export type Dims = [DimType, number];

/** Allowed dimension string keys. @public */
export type DimsString = 'w' | 'h' | 'width' | 'height';

const mapDimsType = {
  w: 'width',
  h: 'height',
  width: 'width',
  height: 'height',
} as const;

/**
 * Parses a dimension string like `"w::50"` or `"height::100"` into [type, 0..1].
 * @param dim - Quoted string e.g. `"w::50"` (50% width), `"height"` (100% height)
 * @returns Tuple [DimType, number] or null if format is invalid
 * @public
 */
export const parseDims = (dim: string): Dims | null => {
  if (dimRegExp.test(dim)) {
    const [type, percent] = dim.slice(1, -1).split(FN_SEPARATOR);
    const value = parseInt(percent || '', 10);

    return [mapDimsType[type as DimsString], !isNaN(value) ? value / 100 : 1];
  }

  return null;
};
