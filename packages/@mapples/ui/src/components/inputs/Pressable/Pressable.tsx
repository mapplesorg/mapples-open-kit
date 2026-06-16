import { forwardRef, PropsWithChildren } from 'react';

import { StyledPressable, WithStyledProps } from '@mapples/style';
import { PressableProps as RNPressableProps, View } from 'react-native';

/**
 * Props for the Pressable component.
 *
 * Extends React Native's `PressableProps` with the `@mapples/style` styling
 * system via `WithStyledProps`.
 *
 * @public
 */
export type PressableProps = WithStyledProps<RNPressableProps>;

/**
 * A styled pressable container component.
 *
 * Wraps React Native's `Pressable` with the `@mapples/style` `StyledPressable`
 * primitive, exposing the full `WithStyledProps` styling API.
 *
 * @example
 * ```tsx
 * <Pressable
 *   onPress={() => console.log('pressed')}
 *   styled={{ style: { padding: 12, backgroundColor: 'blue' } }}
 * >
 *   <Text>Press me</Text>
 * </Pressable>
 * ```
 *
 * @public
 */
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
