import { RegisteredComponent } from '@mapples/types';

import ImageCarousel from './index';

/**
 * Schematic registration entry for the {@link ImageCarousel} component.
 *
 * Registers `ImageCarousel` under the `'ImageCarousel'` type key so it can be
 * resolved by the `@mapples/render` pipeline via the {@link Components} registry.
 */
export const ImageCarouselSchematic: RegisteredComponent = {
  type: 'ImageCarousel',
  Component: ImageCarousel as any,
};
