import { RegisteredComponent } from '@mapples/types';

import FlatList from './FlatList';

export const FlatListSchematic: RegisteredComponent = {
  type: 'FlatList',
  Component: FlatList as unknown as any,
};

export const GridTwoColumnsSchematic: RegisteredComponent = {
  ...FlatListSchematic,
  type: 'GridTwoColumns',
};

export const GridThreeColumnsSchematic: RegisteredComponent = {
  ...FlatListSchematic,
  type: 'GridThreeColumns',
};

export const GridFourColumnsSchematic: RegisteredComponent = {
  ...FlatListSchematic,
  type: 'GridFourColumns',
};
