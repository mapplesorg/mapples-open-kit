import { forwardRef, PropsWithChildren } from 'react';

import { StyledView, WithStyledProps } from '@mapples/style';
import type { LinearGradient } from '@mapples/types';
import { ViewProps as RNViewProps } from 'react-native';

import GradientLayer from './GradientLayer';

/**
 * Props for the GradientBackground component.
 *
 * @public
 */
export type GradientBackgroundProps = PropsWithChildren<
  WithStyledProps<RNViewProps> & {
    /** The linear gradient painted behind the container's children. */
    gradient?: LinearGradient;
  }
>;

/**
 * A container view with a linear-gradient background.
 *
 * Mirrors `ImageBackgroundView`: it `forwardRef`s to a native `View` (via
 * `StyledView`) so the canvas can measure it (`measureInWindow`) and make it
 * selectable, paints the gradient as a full-bleed layer beneath its children,
 * and is sized by its own `styled.style`. Falls back to the solid
 * `backgroundColor` when no gradient is present or unrenderable.
 *
 * @example
 * ```tsx
 * <GradientBackground
 *   gradient={{
 *     type: 'linear',
 *     stops: [
 *       { color: '#FF5C35', position: 0 },
 *       { color: '#FFC53D', position: 1 },
 *     ],
 *     start: { x: 0, y: 0 },
 *     end: { x: 1, y: 1 },
 *   }}
 *   styled={{ style: { width: 150, height: 150, overflow: 'hidden' } }}
 * >
 *   <Text text="On gradient" />
 * </GradientBackground>
 * ```
 *
 * @public
 */
const GradientBackground = forwardRef(
  ({ styled, children, gradient, ...props }: GradientBackgroundProps, ref) => {
    return (
      <StyledView ref={ref} styled={{ ...styled }} {...props}>
        <GradientLayer gradient={gradient} />
        {children}
      </StyledView>
    );
  },
);
GradientBackground.displayName = 'GradientBackground';

export default GradientBackground;
