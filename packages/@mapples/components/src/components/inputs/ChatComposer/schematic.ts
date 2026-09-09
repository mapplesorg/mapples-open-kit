import { RegisteredComponent } from '@mapples/types';

import ChatComposer from './index';

/** Registers {@link ChatComposer} under the `'ChatComposer'` type key. */
export const ChatComposerSchematic: RegisteredComponent = {
  type: 'ChatComposer',
  Component: ChatComposer,
};
