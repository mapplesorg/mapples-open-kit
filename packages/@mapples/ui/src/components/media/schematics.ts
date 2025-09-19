import { RegisteredComponents } from '@mapples/types';

import { IconSchematics } from './Icon';
import { ImageSchematic } from './Image';
import { VideoSchematic } from './Video';

export const MediaSchematics: RegisteredComponents = {
  [VideoSchematic.type]: VideoSchematic,
  [ImageSchematic.type]: ImageSchematic,
  [IconSchematics.type]: IconSchematics,
};
