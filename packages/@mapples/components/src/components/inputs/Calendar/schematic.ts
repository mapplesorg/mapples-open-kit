import { RegisteredComponent } from '@mapples/types';

import Calendar from './index';

/** Registers {@link Calendar} under the `'Calendar'` type key. */
export const CalendarSchematic: RegisteredComponent = {
  type: 'Calendar',
  Component: Calendar,
};
