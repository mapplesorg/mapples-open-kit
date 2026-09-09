import { RegisteredComponent } from '@mapples/types';

import Skeleton from './index';

/** Registers {@link Skeleton} under the `'Skeleton'` type key. */
export const SkeletonSchematic: RegisteredComponent = {
  type: 'Skeleton',
  Component: Skeleton,
};
