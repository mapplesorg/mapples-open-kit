import { RegisteredComponent } from '@mapples/types';

import LineChart from './index';

/** Registers {@link LineChart} under the `'LineChart'` type key. */
export const LineChartSchematic: RegisteredComponent = {
  type: 'LineChart',
  Component: LineChart,
};
