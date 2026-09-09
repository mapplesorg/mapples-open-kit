import { RegisteredComponent } from '@mapples/types';

import Table from './index';

/** Registers {@link Table} under the `'Table'` type key. */
export const TableSchematic: RegisteredComponent = {
  type: 'Table',
  Component: Table,
};
