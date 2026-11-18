import { RegisteredComponents } from '@mapples/types';

import { AnimatedNumberSchematic } from './AnimatedNumber/schematic';
import { LiveIndicatorSchematic } from './LiveIndicator/schematic';
import { ReactionButtonSchematic } from './ReactionButton/schematic';
import { ResultMarkSchematic } from './ResultMark/schematic';
import { TypewriterTextSchematic } from './TypewriterText/schematic';

/** Runtime registry of the animated components. */
export const AnimatedSchematics: RegisteredComponents = {
  [AnimatedNumberSchematic.type]: AnimatedNumberSchematic,
  [TypewriterTextSchematic.type]: TypewriterTextSchematic,
  [ResultMarkSchematic.type]: ResultMarkSchematic,
  [ReactionButtonSchematic.type]: ReactionButtonSchematic,
  [LiveIndicatorSchematic.type]: LiveIndicatorSchematic,
};
