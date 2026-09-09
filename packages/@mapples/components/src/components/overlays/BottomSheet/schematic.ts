import { RegisteredComponent } from '@mapples/types';

import BottomSheet from './index';

/** Registers {@link BottomSheet} under the `'BottomSheet'` type key. */
export const BottomSheetSchematic: RegisteredComponent = {
  type: 'BottomSheet',
  Component: BottomSheet,
};
