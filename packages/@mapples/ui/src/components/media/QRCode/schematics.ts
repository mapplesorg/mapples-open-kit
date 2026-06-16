import { RegisteredComponent } from '@mapples/types';

import QRCode from './QRCode';

/**
 * Schematic registration entry for the `QRCode` component.
 *
 * Used by the `@mapples/render` pipeline to resolve the `"QRCode"` element
 * type to the `QRCode` React component at runtime.
 *
 * @public
 */
export const QRCodeSchematic: RegisteredComponent = {
  type: 'QRCode',
  Component: QRCode,
};
