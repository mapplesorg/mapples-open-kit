import { RegisteredComponents } from '@mapples/types';

import { AnimatedNumberSchematic } from './AnimatedNumber/schematic';
import { CodeScannerSchematic } from './CodeScanner/schematic';
import { ConfettiSchematic } from './Confetti/schematic';
import { FlipCardSchematic } from './FlipCard/schematic';
import { LiveIndicatorSchematic } from './LiveIndicator/schematic';
import { MarqueeSchematic } from './Marquee/schematic';
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
  [MarqueeSchematic.type]: MarqueeSchematic,
  [ConfettiSchematic.type]: ConfettiSchematic,
  [FlipCardSchematic.type]: FlipCardSchematic,
  [CodeScannerSchematic.type]: CodeScannerSchematic,
};
