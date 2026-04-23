import { forwardRef, PropsWithChildren } from 'react';

import { StyledPressable, WithStyledProps } from '@mapples/style';
import { PressableProps as RNPressableProps, View } from 'react-native';

export type PressableProps = WithStyledProps<RNPressableProps>;

const Pressable = forwardRef<View, PropsWithChildren<PressableProps>>(
  ({ children, ...props }, ref) => {
    return (
      <StyledPressable onPress={console.log} ref={ref} {...props}>
        {children}
      </StyledPressable>
    );
  },
);
Pressable.displayName = 'Pressable';

export default Pressable;
