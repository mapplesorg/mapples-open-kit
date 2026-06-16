import { RegisteredComponent } from '@mapples/types';

import Svg from './Svg';

/**
 * Schematic registration entry for the `Svg` component.
 *
 * Used by the `@mapples/render` pipeline to resolve the `"Svg"` element type
 * to the `Svg` React component at runtime.
 *
 * @public
 */
export const SvgSchematic: RegisteredComponent = {
  type: 'Svg',
  Component: Svg,
};
