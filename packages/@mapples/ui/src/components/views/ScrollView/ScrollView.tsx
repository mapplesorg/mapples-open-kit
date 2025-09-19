import { forwardRef, PropsWithChildren } from 'react';

import { StyledScrollView, WithStyledProps } from '@mapples/style';
import { ViewProps as RNViewProps } from 'react-native';

/**
 * Props for the ScrollView component.
 * 
 * @public
 */
export type ViewProps = PropsWithChildren<WithStyledProps<RNViewProps>>;

/**
 * A customizable scrollable view component with built-in styling support.
 * 
 * The ScrollView component extends React Native's ScrollView with additional styling
 * capabilities through the @mapples/style system. It provides a scrollable container
 * with hidden scroll indicators by default.
 * 
 * @example
 * ```tsx
 * <ScrollView
 *   styled={{
 *     style: {
 *       backgroundColor: 'white',
 *       padding: 16,
 *     },
 *   }}
 * >
 *   <Text>Scrollable content goes here</Text>
 *   <Text>More content...</Text>
 * </ScrollView>
 * ```
 * 
 * @public
 */
const ScrollView = forwardRef(
  ({ styled, children, ...props }: ViewProps, ref) => {
    return (
      <StyledScrollView
        showsVerticalScrollIndicator={false}
        ref={ref}
        styled={{ ...styled }}
        {...props}
      >
        {children}
      </StyledScrollView>
    );
  },
);
ScrollView.displayName = 'ScrollView';

export default ScrollView;
