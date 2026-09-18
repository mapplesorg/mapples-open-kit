import { RegisteredComponent } from '@mapples/types';

import FlatList from './FlatList';
import { GridFourColumns, GridThreeColumns, GridTwoColumns } from './Grid';

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
  type: 'GridTwoColumns',
  Component: GridTwoColumns as unknown as any,
};

/**
 * Schematic configuration for a three-column grid layout backed by FlatList.
 *
 * @public
 */
export const GridThreeColumnsSchematic: RegisteredComponent = {
  type: 'GridThreeColumns',
  Component: GridThreeColumns as unknown as any,
};

/**
 * Schematic configuration for a four-column grid layout backed by FlatList.
 *
 * @public
 */
export const GridFourColumnsSchematic: RegisteredComponent = {
  type: 'GridFourColumns',
  Component: GridFourColumns as unknown as any,
};
