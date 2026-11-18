import { forwardRef, Fragment, ReactElement, Ref } from 'react';

import StateProvider from '@mapples/state';
import {
  StyledFlatList,
  type StyledFlatListProps,
  StyledProp,
  StyledView,
  useScreenScrollHandler,
} from '@mapples/style';
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
  'styled' | 'data'
> & {
  /** The items; optional, so a `$data` binding can supply them alone. */
  data?: StyledFlatListProps<T>['data'];
  styled?: {
    /** Style applied to the outer container view that wraps the list */
    style?: StyledProp<ViewStyle>;
    /** Style applied directly to the `FlatList` component */
    styleList?: StyledProp<ViewStyle>;
    /** Style applied to the scrollable content container of the list */
    contentContainerStyle?: StyledProp<ViewStyle>;
  };
};

/** Milliseconds between the scroll events a screen's chrome reacts to. */
const SCREEN_SCROLL_THROTTLE = 16;

/**
 * A data-driven list component with built-in styling support.
 *
 * `FlatList` renders a scrollable list of items from the `data` prop, wrapping
 * each item in a `StateProvider` so that child components can access item state
 * directly. The outer container and the inner list accept independent `styled`
 * entries, enabling separate layout and scroll-area styling.
 *
 * With `animateChanges` the rows animate when the data changes (a new row
 * fades in, a removed one fades out, the rest slide); the items then need an
 * `id` or `key`. A vertical list also drives the elements of its screen that
 * react to scrolling (a `TopAppBar` with a `scrollBehavior`).
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
    {
      styled,
      children,
      onScroll,
      scrollEventThrottle,
      ...props
    }: FlatListProps<T>,
    ref: Ref<RNView>,
  ) => {
    // A vertical list tells its screen where it stands while an element
    // there reacts to scrolling; otherwise the handler is the author's own.
    const handleScroll = useScreenScrollHandler(onScroll, !props.horizontal);
    const reporting = handleScroll !== (onScroll ?? undefined);

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
          onScroll={handleScroll}
          scrollEventThrottle={
            scrollEventThrottle ??
            (reporting ? SCREEN_SCROLL_THROTTLE : undefined)
          }
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
