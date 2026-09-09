import { RegisteredComponent } from '@mapples/types';

import EmptyState from './index';

/** Registers {@link EmptyState} under the `'EmptyState'` type key. */
export const EmptyStateSchematic: RegisteredComponent = {
  type: 'EmptyState',
  Component: EmptyState,
};
