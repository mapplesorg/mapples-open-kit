import { forwardRef, PropsWithChildren, useCallback } from 'react';

import { StyledView, WithStyledProps } from '@mapples/style';
import { map } from 'lodash';
import { ViewProps as RNViewProps } from 'react-native';

import SelectItem from './SelectItem';

export interface SelectProps<T = string[]>
  extends PropsWithChildren<WithStyledProps<RNViewProps>> {
  data?: T[];
  onSelect?: () => void;
  styled?: WithStyledProps<RNViewProps> & {
    itemStyle?: WithStyledProps<RNViewProps>['style'];
  };
}

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
