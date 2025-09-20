import { RegisteredComponent } from '@mapples/types';

import View from './View';

export const ViewSchematic: RegisteredComponent = {
  type: 'View',
  Component: View,
};

export const ContainerSchematic: RegisteredComponent = {
  ...ViewSchematic,
  type: 'Container',
};
