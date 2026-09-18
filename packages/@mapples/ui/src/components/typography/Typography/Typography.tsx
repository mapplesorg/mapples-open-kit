import { forwardRef, PropsWithChildren } from 'react';

import {
  WithStyledProps,
  Typography as StyledTypography,
  TypographyProps as StyledTypographyProps,
} from '@mapples/style';
import { isNumber, isString } from 'lodash';
import { TextProps as RNTextProps, Text } from 'react-native';

/**
 * Props for the Typography component.
 *
 * @public
 */
export type TextProps = PropsWithChildren<
  WithStyledProps<RNTextProps> & {
    /** The text content to display */
    text?: string;
    /** The typography variant to apply (e.g. `Headline`, `Body`, `Caption`) */
    variant?: StyledTypographyProps['variant'];
    /** Colour that overrides the variant's colour, or `false` to apply none */
    color?: StyledTypographyProps['color'];
  }
>;

/**
 * A styled typography component backed by the `@mapples/style` Typography
 * primitive.
 *
 * Accepts text content via the `text` prop; string and number values are
 * rendered, anything else falls back to `'Not a string'`. Style overrides are
 * applied through the `styled` prop.
 *
 * @example
 * ```tsx
 * <Typography
 *   text="Hello World"
 *   styled={{
 *     style: { fontSize: 24, fontWeight: 'bold' },
 *   }}
 * />
 * ```
 *
 * @public
 */
const Typography = forwardRef<Text, TextProps>(
  ({ styled, children, text, ...props }, ref) => {
    return (
      <StyledTypography
        ref={ref}
        style={styled?.style}
        styled={styled}
        {...props}
      >
        {isString(text) || isNumber(text) ? text.toString() : 'Not a string'}
      </StyledTypography>
    );
  },
);
Typography.displayName = 'Text';

export default Typography;
