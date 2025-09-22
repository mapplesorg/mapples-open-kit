import { forwardRef, PropsWithChildren } from 'react';

import { StyledPressable } from '@mapples/style';
import { PressableProps as RNPressableProps, View } from 'react-native';

export interface PressableProps extends RNPressableProps {
  label?: string;
}

const Pressable = forwardRef<View, PropsWithChildren<PressableProps>>(
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
