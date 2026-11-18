import { ComponentType, forwardRef } from 'react';

import Animated, { useReducedMotion } from 'react-native-reanimated';

import useHostMotion from '../hooks/useHostMotion';
import useMotionControl from '../hooks/useMotionControl';
import useMotionEnabled from '../hooks/useMotionEnabled';
import useStyledProps from '../hooks/useStyledProps';
import { WithStyledProps } from '../types';
import {
  flattenStyleProp,
  hasMotion,
  hasSelectorValues,
  resolveMotionStyle,
} from '../utils';

/**
 * Higher-order component that wraps a React Native component with styled-props support.
 * The wrapped component accepts an additional `styled` prop where all style values can
 * reference theme tokens (e.g., `'theme.colors.primary'`), sizing tokens
 * (e.g., `'sizing.md'`), multiplier expressions (e.g., `'*2'`), and responsive
 * breakpoint overrides (e.g., `{ '&:tablet': { padding: 16 } }`).
 *
 * @param Component - The React Native component to wrap
 * @returns A new component with the same props plus an optional `styled` prop
 *
 * @example
 * ```tsx
 * import { styled } from '@mapples/style';
 * import { View } from 'react-native';
 *
 * const StyledView = styled(View);
 *
 * const MyComponent = () => (
 *   <StyledView
 *     styled={{
 *       style: {
 *         backgroundColor: 'theme.colors.background',
 *         padding: 'sizing.md',
 *         '&:tablet': { padding: 'sizing.lg' },
 *       },
 *     }}
 *   />
 * );
 * ```
 *
 * A style that carries motion keys (`transitionDuration`, `animationName`, …;
 * see `MOTION_STYLE_KEYS`) is rendered through Reanimated's animated version
 * of the component, which runs CSS-style transitions and keyframe animations
 * natively. `animationName` may name a preset from `ANIMATION_PRESETS`. With
 * the OS's reduced-motion setting on, or inside a `MotionProvider` that
 * turned motion off, the motion keys are dropped.
 *
 * Three motion keys are not CSS and become props of the animated component:
 * `exitAnimationName` (how the element leaves when it stops being rendered;
 * a preset from `EXIT_ANIMATION_PRESETS`), `layoutTransitionDuration` (the
 * element moves to its new place when the layout around it changes) and
 * `animationReplay` (`'focus'` plays the animation again each time the
 * element's screen is shown; needs a `ScreenMotionProvider`, which
 * `@mapples/navigation` puts around every route's page). `motionName` names
 * the element for motion commands (`sendMotionCommand`).
 *
 * The same holds for a style with selector values (`opacity: { default: 1,
 * ':active': 0.4 }`): how the element looks while it is pressed, hovered or
 * focused. `@mapples/render` writes them from `style::$pressed` variants.
 */
const styled = <T extends object>(Component: ComponentType<T>) => {
  // Built on first use: most elements never animate, and Reanimated need not
  // wrap a component nothing animates.
  let AnimatedComponent: ComponentType<T> | undefined;

  const ComponentWithRef = forwardRef<unknown, WithStyledProps<T>>(
    ({ styled, ...props }, ref) => {
      const styledProps = useStyledProps(styled);
      // No motion with the OS's reduced-motion setting, nor where a
      // `MotionProvider` turned it off (a design canvas).
      const motionEnabled = useMotionEnabled();
      const reducedMotion = useReducedMotion() || !motionEnabled;

      // The style as motion commands and the focus of the screen leave it.
      const style = useMotionControl(
        flattenStyleProp<Record<string, unknown>>(
          (styledProps as { style?: Record<string, unknown> }).style,
        ),
      );

      // Called for every element so the hook order holds when the first
      // motion key is added or removed; it builds nothing without the keys.
      const hostMotion = useHostMotion(style, reducedMotion);

      if (!hasMotion(style) && !hasSelectorValues(style)) {
        return <Component ref={ref} {...(props as T)} {...styledProps} />;
      }

      AnimatedComponent ??= Animated.createAnimatedComponent(
        Component,
      ) as unknown as ComponentType<T>;

      return (
        <AnimatedComponent
          ref={ref}
          {...(props as T)}
          {...styledProps}
          {...hostMotion}
          style={resolveMotionStyle(style, reducedMotion)}
        />
      );
    },
  );
  ComponentWithRef.displayName = `Styled(${Component.displayName})`;
  return ComponentWithRef;
};

export default styled;
