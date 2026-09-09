import { RegisteredComponent } from '@mapples/types';

import MessageBubble from './index';

/** Registers {@link MessageBubble} under the `'MessageBubble'` type key. */
export const MessageBubbleSchematic: RegisteredComponent = {
  type: 'MessageBubble',
  Component: MessageBubble,
};
