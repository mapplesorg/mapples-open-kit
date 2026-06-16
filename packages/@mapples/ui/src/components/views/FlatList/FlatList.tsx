import { forwardRef, Fragment, ReactElement, Ref } from 'react';

import StateProvider from '@mapples/state';
import { StyledFlatList, StyledProp, StyledView } from '@mapples/style';
import type { StyledFlatListProps } from '@mapples/style/src/components/StyledFlatList';
import type { ListRenderItem, View as RNView, ViewStyle } from 'react-native';

/**
 * Props for the FlatList component.
 *
 * Extends `StyledFlatListProps` with a split `styled` object that applies
 * separate style values to the outer container view, the list itself, and
 * the list's content container.
 *
 * @public
 */
export type FlatListProps<T extends object> = Omit<
  StyledFlatListProps<T>,
  'styled'
> & {
  styled?: {
    /** Style applied to the outer container view that wraps the list */
    style?: StyledProp<ViewStyle>;
    /** Style applied directly to the `FlatList` component */
    styleList?: StyledProp<ViewStyle>;
    /** Style applied to the scrollable content container of the list */
    contentContainerStyle?: StyledProp<ViewStyle>;
  };
};

/**
 * A data-driven list component with built-in styling support.
 *
 * `FlatList` renders a scrollable list of items from the `data` prop, wrapping
 * each item in a `StateProvider` so that child components can access item state
 * directly. The outer container and the inner list accept independent `styled`
 * entries, enabling separate layout and scroll-area styling.
 *
 * @example
 * ```tsx
 * <FlatList
 *   data={items}
 *   styled={{
 *     style: { flex: 1, backgroundColor: 'white' },
 *     styleList: { paddingHorizontal: 16 },
 *     contentContainerStyle: { paddingBottom: 32 },
 *   }}
 * >
 *   <Text text="item name" />
 * </FlatList>
 * ```
 *
 * @public
 */
const FlatListComponent = forwardRef(
  <T extends object>(
    { styled, children, ...props }: FlatListProps<T>,
    ref: Ref<RNView>,
  ) => {
    const containerStyled = { style: styled?.style } as any;
    const listStyled = {
      style: styled?.styleList,
      contentContainerStyle: styled?.contentContainerStyle,
      columnWrapperStyle: (styled as any)?.columnWrapperStyle,
    } as any;

    const renderItem: ListRenderItem<any> = ({ item }) => {
      return (
        <Fragment>
          <StateProvider state={item}>{children}</StateProvider>
        </Fragment>
      );
    };

    return (
      <StyledView ref={ref} styled={containerStyled}>
        <StyledFlatList
          {...(props as any)}
          renderItem={renderItem}
          styled={listStyled}
        />
      </StyledView>
    );
  },
);
FlatListComponent.displayName = 'FlatList';

const FlatListExport = FlatListComponent as <T extends object>(
  props: FlatListProps<T> & { ref?: Ref<RNView> },
) => ReactElement;

export default FlatListExport;
