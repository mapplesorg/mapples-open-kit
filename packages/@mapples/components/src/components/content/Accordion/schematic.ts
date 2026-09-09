import { RegisteredComponent } from '@mapples/types';

import Accordion from './index';

/** Registers {@link Accordion} under the `'Accordion'` type key. */
export const AccordionSchematic: RegisteredComponent = {
  type: 'Accordion',
  Component: Accordion,
};
