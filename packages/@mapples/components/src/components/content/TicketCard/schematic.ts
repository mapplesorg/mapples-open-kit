import { RegisteredComponent } from '@mapples/types';

import TicketCard from './index';

/** Registers {@link TicketCard} under the `'TicketCard'` type key. */
export const TicketCardSchematic: RegisteredComponent = {
  type: 'TicketCard',
  Component: TicketCard,
};
