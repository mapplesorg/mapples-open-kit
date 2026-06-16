import { RegisteredComponent } from '@mapples/types';

import Image from './Image';

/**
 * Schematic registration entry for the `Image` component.
 *
 * Used by the `@mapples/render` pipeline to resolve the `"Image"` element type
 * to the `Image` React component at runtime.
 *
 * @public
 */
export const ImageSchematic: RegisteredComponent = {
  type: 'Image',
  Component: Image,
};
