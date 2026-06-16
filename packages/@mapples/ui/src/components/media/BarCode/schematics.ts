import { RegisteredComponent } from '@mapples/types';

import BarCode from './BarCode';

/**
 * Schematic registration entry for the `BarCode` component.
 *
 * Used by the `@mapples/render` pipeline to resolve the `"BarCode"` element
 * type to the `BarCode` React component at runtime.
 *
 * @public
 */
export const BarCodeSchematic: RegisteredComponent = {
  type: 'BarCode',
  Component: BarCode,
};
