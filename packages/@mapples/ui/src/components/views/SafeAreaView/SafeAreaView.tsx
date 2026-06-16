import { forwardRef, PropsWithChildren } from 'react';

import { StyledSafeAreaView, WithStyledProps } from '@mapples/style';
import { SafeAreaViewProps as RNSafeAreaViewProps } from 'react-native-safe-area-context';

/**
 * Props for the SafeAreaView component.
 *
 * @public
 */
export type SafeAreaViewProps = PropsWithChildren<
  WithStyledProps<RNSafeAreaViewProps>
>;

/**
 * A customizable safe-area view component with built-in styling support.
 *
 * `SafeAreaView` wraps `react-native-safe-area-context`'s `SafeAreaView` and
 * adds styling capabilities through the `@mapples/style` system. It ensures
 * content is rendered within the device's safe-area insets (notch, home
 * indicator, status bar, etc.).
 *
 * @example
 * ```tsx
 * <SafeAreaView
 *   styled={{
 *     style: {
 *       flex: 1,
 *       backgroundColor: 'white',
 *     },
 *   }}
 * >
 *   <Text text="Safe content" />
 * </SafeAreaView>
 * ```
 *
 * @public
 */
const SafeAreaView = forwardRef(
  ({ styled, children, ...props }: SafeAreaViewProps, ref) => {
    return (
      <StyledSafeAreaView ref={ref} styled={{ ...styled }} {...props}>
        {children}
      </StyledSafeAreaView>
    );
  },
);
SafeAreaView.displayName = 'SafeAreaView';

export default SafeAreaView;
