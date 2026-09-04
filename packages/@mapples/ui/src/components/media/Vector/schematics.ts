import { RegisteredComponent } from '@mapples/types';

import VectorComponent from './Vector';

/**
 * Schematic registration entry for the `Vector` component.
 *
 * Used by the `@mapples/render` pipeline to resolve the `"Vector"` element
 * type to the `Vector` React component at runtime.
 *
 * @public
 */
export const VectorSchematic: RegisteredComponent = {
  type: 'Vector',
  Component: VectorComponent,
};
