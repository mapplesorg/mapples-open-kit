import { forwardRef, PropsWithChildren } from 'react';

import { StyledText, WithStyledProps } from '@mapples/style';
import { isNumber, isString } from 'lodash';
import { TextProps as RNTextProps } from 'react-native';

/**
 * Props for the Text component.
 *
 * @public
 */
export type TextProps = PropsWithChildren<
  WithStyledProps<RNTextProps> & {
    /** The text content to display */
    text?: string;
  }
>;

/**
 * A customizable text component with built-in styling support.
 *
 * The Text component extends React Native's Text with additional styling
 * capabilities through the @mapples/style system. Flat text content is supplied
 * via the `text` prop; string and number values are rendered. Nested `Text`
 * children (the React Native styled-span pattern) are rendered inline after the
 * `text`, so a node mixing plain runs and styled runs — e.g. produced by a
 * Figma import of mixed-style text — flows as a single inline run with native
 * style inheritance (children inherit the parent typography, their own style
 * applied on top).
 *
 * @example
 * ```tsx
 * // Flat text
 * <Text text="Hello World" styled={{ style: { fontSize: 18 } }} />
 *
 * // Inline styled spans: renders "Hello bold world" as one run
 * <Text styled={{ style: { fontSize: 14 } }}>
 *   <Text text="Hello " />
 *   <Text text="bold" styled={{ style: { fontWeight: '700' } }} />
 *   <Text text=" world" />
 * </Text>
 * ```
 *
 * @public
 */
const Text = forwardRef(
  ({ styled, children, text, ...props }: TextProps, ref) => {
    const hasText = isString(text) || isNumber(text);
    return (
      <StyledText ref={ref} styled={{ ...styled }} {...props}>
        {hasText ? text!.toString() : null}
        {children}
      </StyledText>
    );
  },
);
Text.displayName = 'Text';

export default Text;
