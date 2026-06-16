import { RegisteredComponents } from '@mapples/types';

import { TextSchematic } from './Text';
import { TypographyComponentSchematics } from './Typography';

/**
 * Combined schematic registry for all typography components.
 *
 * Aggregates {@link TextSchematic} and {@link TypographyComponentSchematics}
 * into a single map keyed by component type string, ready to be merged into
 * the global Mapples component registry.
 *
 * @public
 */
export const TypographySchematics: RegisteredComponents = {
  [TextSchematic.type]: TextSchematic,
  [TypographyComponentSchematics.type]: TypographyComponentSchematics,
};
