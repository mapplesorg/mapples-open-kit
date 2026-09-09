import { RegisteredComponents } from '@mapples/types';

import { BottomActionBarSchematic } from './BottomActionBar/schematic';
import { ButtonGroupSchematic } from './ButtonGroup/schematic';
import { ChipSchematic } from './Chip/schematic';
import { ChipGroupSchematic } from './ChipGroup/schematic';
import { FabSchematic } from './Fab/schematic';
import { SegmentedControlSchematic } from './SegmentedControl/schematic';

/** Runtime registry of the action components. */
export const ActionsSchematics: RegisteredComponents = {
  [FabSchematic.type]: FabSchematic,
  [ChipSchematic.type]: ChipSchematic,
  [ChipGroupSchematic.type]: ChipGroupSchematic,
  [SegmentedControlSchematic.type]: SegmentedControlSchematic,
  [ButtonGroupSchematic.type]: ButtonGroupSchematic,
  [BottomActionBarSchematic.type]: BottomActionBarSchematic,
};
