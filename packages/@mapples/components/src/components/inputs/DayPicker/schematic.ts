import { RegisteredComponent } from '@mapples/types';

import DayPicker from './index';

/** Registers {@link DayPicker} under the `'DayPicker'` type key. */
export const DayPickerSchematic: RegisteredComponent = {
  type: 'DayPicker',
  Component: DayPicker,
};
