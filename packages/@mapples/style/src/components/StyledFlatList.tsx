import { ForwardedRef, forwardRef, ReactElement, Ref } from 'react';

import { FlatList, FlatListProps } from 'react-native';

import { useStyled } from '../hooks';
import { StyledProps } from '../types';

/**
 * Props for the StyledFlatList component.
 */
export type StyledFlatListProps<T extends object> = FlatListProps<T> & {
  /** Styled props for advanced styling with theme and responsive support */
  styled?: Partial<StyledProps<FlatListProps<T>>>;
};

/**
 * Styled FlatList component that supports theme and responsive styling.
 * This component extends the standard FlatList with styled props support.
 *
 * @param props - The component props
 * @param props.styled - Styled props for advanced styling
 * @param props.data - Array of data items to render
 * @param props.renderItem - Function to render each item
 * @param props.children - Child components (if using as a container)
 *
 * @example
 * ```tsx
 * import { StyledFlatList } from '@mapples/style';
 *
 * const MyComponent = () => {
 *   const data = [{ id: 1, title: 'Item 1' }, { id: 2, title: 'Item 2' }];
 *
 *   return (
 *     <StyledFlatList
 *       data={data}
 *       renderItem={({ item }) => <Text>{item.title}</Text>}
 *       styled={{
 *         contentContainerStyle: {
 *           backgroundColor: 'theme.colors.background',
 *           padding: 'sizing.md'
 *         }
 *       }}
 *     />
 *   );
 * };
 * ```
 */
const StyledFlatListComponent = forwardRef(
  <T extends object>(
    { styled, ...props }: StyledFlatListProps<T>,
    ref: ForwardedRef<FlatList<T>>,
  ) => {
    const styledProps = useStyled(styled);

    return <FlatList ref={ref} {...props} {...styledProps} />;
  },
);
StyledFlatListComponent.displayName = 'Styled(FlatList)';

const StyledFlatList = StyledFlatListComponent as <T extends object>(
  props: StyledFlatListProps<T> & { ref?: Ref<FlatList<T>> },
) => ReactElement;

export default StyledFlatList;
