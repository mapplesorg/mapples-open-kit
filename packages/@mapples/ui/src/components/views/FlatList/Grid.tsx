import { forwardRef, ReactElement, Ref } from 'react';

import type { View as RNView } from 'react-native';

import FlatList, { FlatListProps } from './FlatList';

type Grid = <T extends object>(
  props: FlatListProps<T> & { ref?: Ref<RNView> },
) => ReactElement;

const createGrid = (numColumns: number, displayName: string): Grid => {
  const GridComponent = forwardRef(
    <T extends object>(props: FlatListProps<T>, ref: Ref<RNView>) => {
      return <FlatList numColumns={numColumns} ref={ref} {...props} />;
    },
  );
  GridComponent.displayName = displayName;
  return GridComponent as Grid;
};

/**
 * A FlatList laid out in two columns. Renders its child template once per
 * `data` item; it takes every FlatList prop.
 *
 * @example
 * ```tsx
 * <GridTwoColumns
 *   data={products}
 *   styled={{ columnWrapperStyle: { gap: 12 } }}
 * >
 *   <Text text="item name" />
 * </GridTwoColumns>
 * ```
 *
 * @public
 */
export const GridTwoColumns = createGrid(2, 'GridTwoColumns');

/**
 * A FlatList laid out in three columns. Renders its child template once per
 * `data` item; it takes every FlatList prop.
 *
 * @public
 */
export const GridThreeColumns = createGrid(3, 'GridThreeColumns');

/**
 * A FlatList laid out in four columns. Renders its child template once per
 * `data` item; it takes every FlatList prop.
 *
 * @public
 */
export const GridFourColumns = createGrid(4, 'GridFourColumns');
