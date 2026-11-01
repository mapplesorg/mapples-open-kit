import { RegisteredComponent } from '@mapples/types';

import ReorderableList from './index';

/** Registers {@link ReorderableList} under the `'ReorderableList'` type key. */
export const ReorderableListSchematic: RegisteredComponent = {
  type: 'ReorderableList',
  Component: ReorderableList,
};
