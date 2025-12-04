import { RegisteredComponents } from '@mapples/types';

import { BarCodeSchematic } from './BarCode';
import { IconSchematics } from './Icon';
import { ImageSchematic } from './Image';
import { QRCodeSchematic } from './QRCode';
import { VideoSchematic } from './Video';

export const MediaSchematics: RegisteredComponents = {
  [VideoSchematic.type]: VideoSchematic,
  [ImageSchematic.type]: ImageSchematic,
  [IconSchematics.type]: IconSchematics,
  [BarCodeSchematic.type]: BarCodeSchematic,
  [QRCodeSchematic.type]: QRCodeSchematic,
};
