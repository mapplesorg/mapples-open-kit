import { RegisteredComponent } from '@mapples/types';

import ChoiceGrid from './index';

/** Registers {@link ChoiceGrid} under the `'ChoiceGrid'` type key. */
export const ChoiceGridSchematic: RegisteredComponent = {
  type: 'ChoiceGrid',
  Component: ChoiceGrid,
};
