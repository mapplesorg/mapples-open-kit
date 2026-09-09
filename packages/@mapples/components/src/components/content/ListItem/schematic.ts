import { RegisteredComponent } from '@mapples/types';

import ListItem from './index';

/** Registers {@link ListItem} under the `'ListItem'` type key. */
export const ListItemSchematic: RegisteredComponent = {
  type: 'ListItem',
  Component: ListItem,
};
