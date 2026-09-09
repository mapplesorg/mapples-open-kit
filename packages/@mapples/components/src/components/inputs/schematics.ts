import { RegisteredComponents } from '@mapples/types';

import { ChatComposerSchematic } from './ChatComposer/schematic';
import { CheckboxSchematic } from './Checkbox/schematic';
import { InputFieldSchematic } from './InputField/schematic';
import { NumberStepperSchematic } from './NumberStepper/schematic';
import { PinInputSchematic } from './PinInput/schematic';
import { RadioGroupSchematic } from './RadioGroup/schematic';
import { RatingSchematic } from './Rating/schematic';
import { SearchBarSchematic } from './SearchBar/schematic';
import { SelectFieldSchematic } from './SelectField/schematic';
import { SliderSchematic } from './Slider/schematic';
import { SwitchSchematic } from './Switch/schematic';

/** Runtime registry of the input components. */
export const InputsSchematics: RegisteredComponents = {
  [InputFieldSchematic.type]: InputFieldSchematic,
  [SwitchSchematic.type]: SwitchSchematic,
  [CheckboxSchematic.type]: CheckboxSchematic,
  [SliderSchematic.type]: SliderSchematic,
  [SearchBarSchematic.type]: SearchBarSchematic,
  [PinInputSchematic.type]: PinInputSchematic,
  [SelectFieldSchematic.type]: SelectFieldSchematic,
  [RadioGroupSchematic.type]: RadioGroupSchematic,
  [NumberStepperSchematic.type]: NumberStepperSchematic,
  [RatingSchematic.type]: RatingSchematic,
  [ChatComposerSchematic.type]: ChatComposerSchematic,
};
