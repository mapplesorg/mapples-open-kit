import { RegisteredComponents } from '@mapples/types';

import { ButtonSchematic } from './Button';
import { IconButtonSchematics } from './IconButton';
import { PressableSchematics } from './Pressable';
import { TextInputSchematic } from './TextInput';

export const InputsSchematics: RegisteredComponents = {
  [TextInputSchematic.type]: TextInputSchematic,
  [ButtonSchematic.type]: ButtonSchematic,
  [IconButtonSchematics.type]: IconButtonSchematics,
  [PressableSchematics.type]: PressableSchematics,
};
