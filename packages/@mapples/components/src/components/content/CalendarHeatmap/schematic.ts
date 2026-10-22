import { RegisteredComponent } from '@mapples/types';

import CalendarHeatmap from './index';

/** Registers {@link CalendarHeatmap} under the `'CalendarHeatmap'` type key. */
export const CalendarHeatmapSchematic: RegisteredComponent = {
  type: 'CalendarHeatmap',
  Component: CalendarHeatmap,
};
