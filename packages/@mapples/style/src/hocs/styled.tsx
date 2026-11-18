import {
  Children,
  ComponentType,
  forwardRef,
  isValidElement,
  ReactNode,
  useContext,
} from 'react';

import Animated, { useReducedMotion } from 'react-native-reanimated';

import MotionStagger from '../components/MotionStagger';
import { STAGGER_MAX_STEPS, STAGGER_STYLE_KEY } from '../constants/motion';
import MotionStaggerContext from '../context/MotionStaggerContext';
import useHostMotion from '../hooks/useHostMotion';
import useMotionControl from '../hooks/useMotionControl';
import useMotionEnabled from '../hooks/useMotionEnabled';
import useMotionTokens from '../hooks/useMotionTokens';
import useStyledProps from '../hooks/useStyledProps';
import useTheme from '../hooks/useTheme';
import { WithStyledProps } from '../types';
import {
  flattenStyleProp,
  hasMotion,
  hasSelectorValues,
  parseMotionTime,
  resolveMotionStyle,
  withoutStagger,
} from '../utils';

/**
 * The children of an element with `animationStagger`, each told to start
 * its animations one step later than the one before it. Empty children
 * (`null`, `false`) take no step.
 */
const staggered = (children: ReactNode, step: number): ReactNode =>
  Children.toArray(children).map((child, index) => (
    <MotionStagger
      key={isValidElement(child) && child.key != null ? child.key : index}
      delay={Math.min(index, STAGGER_MAX_STEPS) * step}
    >
      {child}
    </MotionStagger>
  ));

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
 * natively. `animationName` may name a preset from `ANIMATION_PRESETS` or one
 * of the project's keyframe sets, and a timing function may be a curve
 * written as text (`cubic-bezier(0.3, 1.4, 0.5, 1)`) or one of the project's
 * easing tokens (`easing.spring`); both come from the `motionConfig` of the
 * `StyleProvider`. `animationStagger` on a parent starts each child's
 * animation that much later than the one before it. With
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
      const tokens = useMotionTokens();
      const { getColor } = useTheme();
      const hostMotion = useHostMotion(style, reducedMotion, tokens);
      const staggerDelay = useContext(MotionStaggerContext);

      // A parent's stagger is an instruction for its children, not a style.
      const staggerStep = reducedMotion
        ? undefined
        : parseMotionTime(style?.[STAGGER_STYLE_KEY]);
      const hostProps = staggerStep
        ? {
            ...(props as T),
            children: staggered(
              (props as { children?: ReactNode }).children,
              staggerStep,
            ),
          }
        : (props as T);

      if (!hasMotion(style) && !hasSelectorValues(style)) {
        return (
          <Component
            ref={ref}
            {...hostProps}
            {...styledProps}
            {...(style && STAGGER_STYLE_KEY in style
              ? { style: withoutStagger(style) }
              : null)}
          />
        );
      }

      AnimatedComponent ??= Animated.createAnimatedComponent(
        Component,
      ) as unknown as ComponentType<T>;

      return (
        <AnimatedComponent
          ref={ref}
          {...hostProps}
          {...styledProps}
          {...hostMotion}
          style={resolveMotionStyle(style, {
            reducedMotion,
            tokens,
            staggerDelay,
            getColor,
          })}
        />
      );
    },
  );
  ComponentWithRef.displayName = `Styled(${Component.displayName})`;
  return ComponentWithRef;
};

export default styled;
