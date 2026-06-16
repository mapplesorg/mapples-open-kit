import { ComponentType, forwardRef } from 'react';

import useStyledProps from '../hooks/useStyledProps';
import { WithStyledProps } from '../types';

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
 */
const styled = <T extends object>(Component: ComponentType<T>) => {
  const ComponentWithRef = forwardRef<unknown, WithStyledProps<T>>(
    ({ styled, ...props }, ref) => {
      const styledProps = useStyledProps(styled);

      return <Component ref={ref} {...(props as T)} {...styledProps} />;
    },
  );
  ComponentWithRef.displayName = `Styled(${Component.displayName})`;
  return ComponentWithRef;
};

export default styled;
