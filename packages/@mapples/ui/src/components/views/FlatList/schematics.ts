import { RegisteredComponent } from '@mapples/types';

import FlatList from './FlatList';

/**
 * Schematic configuration for the FlatList component.
 *
 * @public
 */
export const FlatListSchematic: RegisteredComponent = {
  type: 'FlatList',
  Component: FlatList as unknown as any,
};

/**
 * Schematic configuration for a two-column grid layout backed by FlatList.
 *
 * @public
 */
export const GridTwoColumnsSchematic: RegisteredComponent = {
  ...FlatListSchematic,
  type: 'GridTwoColumns',
};

/**
 * Schematic configuration for a three-column grid layout backed by FlatList.
 *
 * @public
 */
export const GridThreeColumnsSchematic: RegisteredComponent = {
  ...FlatListSchematic,
  type: 'GridThreeColumns',
};

/**
 * Schematic configuration for a four-column grid layout backed by FlatList.
 *
 * @public
 */
export const GridFourColumnsSchematic: RegisteredComponent = {
  ...FlatListSchematic,
  type: 'GridFourColumns',
};
