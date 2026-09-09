import { RegisteredComponent } from '@mapples/types';

import Breadcrumbs from './index';

/** Registers {@link Breadcrumbs} under the `'Breadcrumbs'` type key. */
export const BreadcrumbsSchematic: RegisteredComponent = {
  type: 'Breadcrumbs',
  Component: Breadcrumbs,
};
