import { RegisteredComponent } from '@mapples/types';

import TimePicker from './index';

/** Registers {@link TimePicker} under the `'TimePicker'` type key. */
export const TimePickerSchematic: RegisteredComponent = {
  type: 'TimePicker',
  Component: TimePicker,
};
