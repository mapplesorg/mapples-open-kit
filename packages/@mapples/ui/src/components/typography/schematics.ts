import { RegisteredComponents } from '@mapples/types';

import { TextSchematic } from './Text';
import { TypographyComponentSchematics } from './Typography';

export const TypographySchematics: RegisteredComponents = {
  [TextSchematic.type]: TextSchematic,
  [TypographyComponentSchematics.type]: TypographyComponentSchematics,
};
