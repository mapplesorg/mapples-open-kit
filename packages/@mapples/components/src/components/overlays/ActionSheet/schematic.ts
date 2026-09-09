import { RegisteredComponent } from '@mapples/types';

import ActionSheet from './index';

/** Registers {@link ActionSheet} under the `'ActionSheet'` type key. */
export const ActionSheetSchematic: RegisteredComponent = {
  type: 'ActionSheet',
  Component: ActionSheet,
};
