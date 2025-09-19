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
 * capabilities through the @mapples/style system. It can display text content
 * either through the `text` prop or as children.
 *
 * @example
 * ```tsx
 * <Text
 *   text="Hello World"
 *   styled={{
 *     style: {
 *       fontSize: 18,
 *       color: 'blue',
 *       fontWeight: 'bold'
 *     }
 *   }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Text styled={{ style: { fontSize: 16, color: 'black' } }}>
 *   This is text content as children
 * </Text>
 * ```
 *
 * @public
 */
const Text = forwardRef(
  ({ styled, children, text, ...props }: TextProps, ref) => {
    return (
      <StyledText ref={ref} styled={{ ...styled }} {...props}>
        {isString(text) || isNumber(text) ? text.toString() : 'Not a string'}
      </StyledText>
    );
  },
);
Text.displayName = 'Text';

export default Text;
