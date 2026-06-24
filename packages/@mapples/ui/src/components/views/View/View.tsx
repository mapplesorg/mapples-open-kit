import { forwardRef, PropsWithChildren } from 'react';

import { StyledView, WithStyledProps } from '@mapples/style';
import type { LinearGradient } from '@mapples/types';
import { ViewProps as RNViewProps } from 'react-native';

import { GradientLayer } from '../GradientBackground';

/**
 * Props for the View component.
 *
 * @public
 */
export type ViewProps = PropsWithChildren<
  WithStyledProps<RNViewProps> & {
    /**
     * Optional linear-gradient background painted behind the view's children
     * (e.g. emitted by a Figma import). Falls back to the solid
     * `backgroundColor` when absent or unrenderable.
     */
    gradient?: LinearGradient;
  }
>;

/**
 * A customizable view component with built-in styling support.
 *
 * The View component extends React Native's View with additional styling
 * capabilities through the @mapples/style system. It serves as a container
 * for other UI elements and supports all standard view properties.
 *
 * @example
 * ```tsx
 * <View
 *   styled={{
 *     style: {
 *       backgroundColor: 'lightblue',
 *       padding: 16,
 *       borderRadius: 8
 *     }
 *   }}
 * >
 *   <Text>Content inside the view</Text>
 * </View>
 * ```
 *
 * @public
 */
const View = forwardRef(
  ({ styled, children, gradient, ...props }: ViewProps, ref) => {
    return (
      <StyledView ref={ref} styled={{ ...styled }} {...props}>
        <GradientLayer gradient={gradient} />
        {children}
      </StyledView>
    );
  },
);
View.displayName = 'View';

export default View;
