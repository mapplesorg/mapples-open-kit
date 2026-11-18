import { RegisteredComponent } from '@mapples/types';

import ReactionButton from './index';

/** Registers {@link ReactionButton} under the `'ReactionButton'` type key. */
export const ReactionButtonSchematic: RegisteredComponent = {
  type: 'ReactionButton',
  Component: ReactionButton,
};
