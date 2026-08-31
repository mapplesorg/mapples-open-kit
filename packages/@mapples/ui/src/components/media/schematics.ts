import { RegisteredComponents } from '@mapples/types';

import { BarCodeSchematic } from './BarCode';
import { IconSchematics } from './Icon';
import { ImageSchematic } from './Image';
import { QRCodeSchematic } from './QRCode';
import { SvgSchematic } from './Svg';
import { VectorSchematic } from './Vector';
import { VideoSchematic } from './Video';

/**
 * Aggregated schematic map for all media components.
 *
 * Combines the registration entries for `Video`, `Image`, `Icon`, `Vector`,
 * `BarCode`, `QRCode`, and `Svg` into a single `RegisteredComponents` map that
 * can be passed to the `@mapples/render` pipeline.
 *
 * @public
 */
export const MediaSchematics: RegisteredComponents = {
  [VideoSchematic.type]: VideoSchematic,
  [ImageSchematic.type]: ImageSchematic,
  [IconSchematics.type]: IconSchematics,
  [VectorSchematic.type]: VectorSchematic,
  [BarCodeSchematic.type]: BarCodeSchematic,
  [QRCodeSchematic.type]: QRCodeSchematic,
  [SvgSchematic.type]: SvgSchematic,
};
