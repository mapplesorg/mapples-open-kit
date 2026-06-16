import { RegisteredComponents } from '@mapples/types';

import { ImageCarouselSchematic } from './components/ImageCarousel/schematic';

/**
 * Registry of all `@mapples/components` components, keyed by their schematic
 * `type` string.
 *
 * Pass this object to the `@mapples/render` pipeline so it can resolve
 * component types at runtime.
 *
 * @example
 * ```tsx
 * import { Components } from '@mapples/components';
 * import { RenderEngine } from '@mapples/render';
 *
 * <RenderEngine components={Components} tree={tree} />
 * ```
 */
export const Components: RegisteredComponents = {
  [ImageCarouselSchematic.type]: ImageCarouselSchematic,
};
