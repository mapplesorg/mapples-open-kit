import { forwardRef, PropsWithChildren } from 'react';

import { StyledPressable } from '@mapples/style';
import { PressableProps, View } from 'react-native';

export interface ButtonProps extends PressableProps {
  label?: string;
}

const Pressable = forwardRef<View, PropsWithChildren<ButtonProps>>(
  ({ label, children, ...props }, ref) => {
    return (
      <StyledPressable onPress={console.log} ref={ref} {...props}>
        {children}
      </StyledPressable>
    );
  },
);
Pressable.displayName = 'Pressable';

export default Pressable;
