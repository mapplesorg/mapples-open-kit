import { RegisteredComponent } from '@mapples/types';

import TypewriterText from './index';

/** Registers {@link TypewriterText} under the `'TypewriterText'` type key. */
export const TypewriterTextSchematic: RegisteredComponent = {
  type: 'TypewriterText',
  Component: TypewriterText,
};
