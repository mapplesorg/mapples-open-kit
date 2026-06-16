import { forwardRef, PropsWithChildren, useCallback } from 'react';

import { StyledView, WithStyledProps } from '@mapples/style';
import { map } from 'lodash';
import { ViewProps as RNViewProps } from 'react-native';

import SelectItem from './SelectItem';

/**
 * Props for the Select component.
 *
 * @typeParam T - The type of each item in the `data` array. Defaults to `string[]`.
 *
 * @public
 */
export interface SelectProps<T = string[]> extends PropsWithChildren<
  WithStyledProps<RNViewProps>
> {
  /** Array of data items to render as selectable options. */
  data?: T[];
  /** Callback invoked when an item is selected. */
  onSelect?: () => void;
  /** Styling configuration for the container and individual items. */
  styled?: WithStyledProps<RNViewProps> & {
    /** Style applied to each `SelectItem` row. */
    itemStyle?: WithStyledProps<RNViewProps>['style'];
  };
}

/**
 * A list component that renders each item in `data` as a pressable `SelectItem`.
 *
 * Each item is wrapped with a `StateProvider` so that child components can
 * consume the item's value through the `@mapples/state` context.
 *
 * @example
 * ```tsx
 * <Select
 *   data={['Apple', 'Banana', 'Cherry']}
 *   onSelect={(item) => console.log('Selected:', item)}
 *   styled={{ style: { gap: 8 }, itemStyle: { padding: 12 } }}
 * >
 *   <Text>{/* rendered inside each SelectItem via children *\/}</Text>
 * </Select>
 * ```
 *
 * @public
 */
const Select = forwardRef(
  ({ styled, children, data, onSelect, ...props }: SelectProps, ref) => {
    const { itemStyle, ...viewStyle } = styled || {};

    const renderSelectItem = useCallback(
      (item: any, i: number) => {
        return (
          <SelectItem
            key={i}
            state={item}
            onSelect={onSelect}
            styled={{ style: itemStyle }}
          >
            {children}
          </SelectItem>
        );
      },
      [children, itemStyle, onSelect],
    );

    return (
      <StyledView ref={ref} styled={{ ...viewStyle }} {...props}>
        {map(data, renderSelectItem)}
      </StyledView>
    );
  },
);
Select.displayName = 'Select';

export default Select;
