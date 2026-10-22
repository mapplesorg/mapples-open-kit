import { RegisteredComponents } from '@mapples/types';

import { CalendarSchematic } from './Calendar/schematic';
import { ChatComposerSchematic } from './ChatComposer/schematic';
import { CheckboxSchematic } from './Checkbox/schematic';
import { ChoiceGridSchematic } from './ChoiceGrid/schematic';
import { DayPickerSchematic } from './DayPicker/schematic';
import { InputFieldSchematic } from './InputField/schematic';
import { NumberStepperSchematic } from './NumberStepper/schematic';
import { NumericKeypadSchematic } from './NumericKeypad/schematic';
import { PinInputSchematic } from './PinInput/schematic';
import { RadioGroupSchematic } from './RadioGroup/schematic';
import { RangeSliderSchematic } from './RangeSlider/schematic';
import { RatingSchematic } from './Rating/schematic';
import { SearchBarSchematic } from './SearchBar/schematic';
import { SelectFieldSchematic } from './SelectField/schematic';
import { SliderSchematic } from './Slider/schematic';
import { SwitchSchematic } from './Switch/schematic';
import { TimePickerSchematic } from './TimePicker/schematic';

/** Runtime registry of the input components. */
export const InputsSchematics: RegisteredComponents = {
  [InputFieldSchematic.type]: InputFieldSchematic,
  [SwitchSchematic.type]: SwitchSchematic,
  [CheckboxSchematic.type]: CheckboxSchematic,
  [SliderSchematic.type]: SliderSchematic,
  [RangeSliderSchematic.type]: RangeSliderSchematic,
  [SearchBarSchematic.type]: SearchBarSchematic,
  [PinInputSchematic.type]: PinInputSchematic,
  [SelectFieldSchematic.type]: SelectFieldSchematic,
  [RadioGroupSchematic.type]: RadioGroupSchematic,
  [NumberStepperSchematic.type]: NumberStepperSchematic,
  [RatingSchematic.type]: RatingSchematic,
  [DayPickerSchematic.type]: DayPickerSchematic,
  [CalendarSchematic.type]: CalendarSchematic,
  [TimePickerSchematic.type]: TimePickerSchematic,
  [ChatComposerSchematic.type]: ChatComposerSchematic,
  [NumericKeypadSchematic.type]: NumericKeypadSchematic,
  [ChoiceGridSchematic.type]: ChoiceGridSchematic,
};
