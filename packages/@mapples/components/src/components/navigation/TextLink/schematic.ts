import { RegisteredComponent } from '@mapples/types';

import TextLink from './index';

/** Registers {@link TextLink} under the `'TextLink'` type key. */
export const TextLinkSchematic: RegisteredComponent = {
  type: 'TextLink',
  Component: TextLink,
};
