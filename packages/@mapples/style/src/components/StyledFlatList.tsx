import { forwardRef, LegacyRef, ReactElement } from 'react';

import { FlatList, FlatListProps } from 'react-native';

import { useStyled } from '../hooks';
import { StyledProps } from '../types';

export type StyledFlatListProps<T extends object> = FlatListProps<T> & {
  styled?: Partial<StyledProps<FlatListProps<T>>>;
};

const StyledFlatListComponent = forwardRef(
  <T extends object>(
    { styled, ...props }: StyledFlatListProps<T>,
    ref: LegacyRef<FlatList<T>>,
  ) => {
    const styledProps = useStyled(styled);

    return <FlatList ref={ref} {...props} {...styledProps} />;
  },
);
StyledFlatListComponent.displayName = 'Styled(FlatList)';

const StyledFlatList = StyledFlatListComponent as <T extends object>(
  props: StyledFlatListProps<T> & { ref?: LegacyRef<FlatList<T>> },
) => ReactElement;

export default StyledFlatList;
