import { RegisteredComponent } from '@mapples/types';

import SectionHeader from './index';

/** Registers {@link SectionHeader} under the `'SectionHeader'` type key. */
export const SectionHeaderSchematic: RegisteredComponent = {
  type: 'SectionHeader',
  Component: SectionHeader,
};
