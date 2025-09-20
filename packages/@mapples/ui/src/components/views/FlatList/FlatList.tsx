import { forwardRef, Fragment, ReactElement, Ref } from 'react';

import StateProvider from '@mapples/state';
import { StyledFlatList, StyledProp, StyledView } from '@mapples/style';
import type { StyledFlatListProps } from '@mapples/style/src/components/StyledFlatList';
import type { ListRenderItem, View as RNView, ViewStyle } from 'react-native';

export type FlatListProps<T extends object> = Omit<
  StyledFlatListProps<T>,
  'styled'
> & {
  styled?: {
    style?: StyledProp<ViewStyle>;
    styleList?: StyledProp<ViewStyle>;
    contentContainerStyle?: StyledProp<ViewStyle>;
  };
};

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
