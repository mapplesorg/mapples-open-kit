import { RegisteredComponent } from '@mapples/types';

import BarChart from './index';

/** Registers {@link BarChart} under the `'BarChart'` type key. */
export const BarChartSchematic: RegisteredComponent = {
  type: 'BarChart',
  Component: BarChart,
};
