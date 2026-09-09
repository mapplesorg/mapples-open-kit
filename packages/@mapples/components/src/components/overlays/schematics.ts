import { RegisteredComponents } from '@mapples/types';

import { ActionSheetSchematic } from './ActionSheet/schematic';
import { BottomSheetSchematic } from './BottomSheet/schematic';
import { DialogSchematic } from './Dialog/schematic';

/** Runtime registry of the overlay components. */
export const OverlaysSchematics: RegisteredComponents = {
  [DialogSchematic.type]: DialogSchematic,
  [BottomSheetSchematic.type]: BottomSheetSchematic,
  [ActionSheetSchematic.type]: ActionSheetSchematic,
};
