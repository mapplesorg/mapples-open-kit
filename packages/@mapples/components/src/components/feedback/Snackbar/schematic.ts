import { RegisteredComponent } from '@mapples/types';

import Snackbar from './index';

/** Registers {@link Snackbar} under the `'Snackbar'` type key. */
export const SnackbarSchematic: RegisteredComponent = {
  type: 'Snackbar',
  Component: Snackbar,
};
