import { FC, PropsWithChildren } from 'react';

import StateProvider from '@mapples/state';
import { WithStyledProps } from '@mapples/style';

import Pressable, { PressableProps } from '../Pressable';

/**
 * Props for the SelectItem component.
 *
 * @public
 */
export interface SelectItemProps extends PropsWithChildren<
  WithStyledProps<PressableProps>
> {
  /** The data value associated with this item, injected into `StateProvider`. */
  state?: any;
  /** Callback invoked with the item's `state` value when the row is pressed. */
  onSelect?: (data: any) => void;
}

/**
 * A single pressable row within a `Select` list.
 *
 * Wraps its children inside a `StateProvider` so that downstream components
 * can read the current item value from the `@mapples/state` context. Calls
 * `onSelect` with the row's `state` value when pressed.
 *
 * @example
 * ```tsx
 * <SelectItem state={{ id: 1, label: 'Apple' }} onSelect={(item) => console.log(item)}>
 *   <Text>Apple</Text>
 * </SelectItem>
 * ```
 *
 * @public
 */
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
