import { RegisteredComponent } from '@mapples/types';

import Dialog from './index';

/** Registers {@link Dialog} under the `'Dialog'` type key. */
export const DialogSchematic: RegisteredComponent = {
  type: 'Dialog',
  Component: Dialog,
};
