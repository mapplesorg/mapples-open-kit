import { RegisteredComponents } from '@mapples/types';

import { ButtonSchematic } from './Button';
import { IconButtonSchematics } from './IconButton';
import { PressableSchematics } from './Pressable';
import { SelectSchematics } from './Select';
import { TextInputSchematic } from './TextInput';

/**
 * Aggregated schematic configurations for all input components.
 *
 * Keyed by component type string, this map is consumed by the visual editor
 * to register every input component (Button, IconButton, Pressable, Select,
 * TextInput) in a single pass.
 *
 * @public
 */
export const InputsSchematics: RegisteredComponents = {
  [TextInputSchematic.type]: TextInputSchematic,
  [ButtonSchematic.type]: ButtonSchematic,
  [IconButtonSchematics.type]: IconButtonSchematics,
  [PressableSchematics.type]: PressableSchematics,
  [SelectSchematics.type]: SelectSchematics,
};
