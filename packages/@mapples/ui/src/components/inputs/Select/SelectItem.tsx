import { FC, PropsWithChildren } from 'react';

import StateProvider from '@mapples/state';
import { WithStyledProps } from '@mapples/style';

import Pressable, { PressableProps } from '../Pressable';

export interface SelectItemProps
  extends PropsWithChildren<WithStyledProps<PressableProps>> {
  state?: any;
  onSelect?: (data: any) => void;
}

const SelectItem: FC<SelectItemProps> = ({
  state,
  children,
  onSelect,
  ...props
}) => {
  const handleSelect = () => {
    onSelect?.(state);
  };

  return (
    <StateProvider state={state}>
      <Pressable {...props} onPress={handleSelect}>
        {children}
      </Pressable>
    </StateProvider>
  );
};

export default SelectItem;
