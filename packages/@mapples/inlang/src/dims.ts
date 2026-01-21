import { FN_SEPARATOR } from './constants';

const dimRegExp = new RegExp(`^"(w|h|width|height)(${FN_SEPARATOR}\\d+)?"$`);

export type DimType = 'width' | 'height';
export type Dims = [DimType, number];
export type DimsString = 'w' | 'h' | 'width' | 'height';

const mapDimsType = {
  w: 'width',
  h: 'height',
  width: 'width',
  height: 'height',
} as const;

export const parseDims = (dim: string): Dims | null => {
  if (dimRegExp.test(dim)) {
    const [type, percent] = dim.slice(1, -1).split(FN_SEPARATOR);
    const value = parseInt(percent || '', 10);

    return [mapDimsType[type as DimsString], !isNaN(value) ? value / 100 : 1];
  }

  return null;
};
