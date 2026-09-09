import { RegisteredComponent } from '@mapples/types';

import SearchBar from './index';

/** Registers {@link SearchBar} under the `'SearchBar'` type key. */
export const SearchBarSchematic: RegisteredComponent = {
  type: 'SearchBar',
  Component: SearchBar,
};
