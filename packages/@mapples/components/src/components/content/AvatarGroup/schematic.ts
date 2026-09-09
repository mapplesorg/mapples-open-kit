import { RegisteredComponent } from '@mapples/types';

import AvatarGroup from './index';

/** Registers {@link AvatarGroup} under the `'AvatarGroup'` type key. */
export const AvatarGroupSchematic: RegisteredComponent = {
  type: 'AvatarGroup',
  Component: AvatarGroup,
};
