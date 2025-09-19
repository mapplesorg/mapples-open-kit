import { forwardRef, useMemo } from 'react';

import { TextProps, TextStyle, Text } from 'react-native';

import { useTypography } from '../hooks';
import { StyledProp, StyledProps } from '../types';
import { Styler } from '../utils';

import { StyledText } from './styled';

/**
 * Props for the Typography component.
 */
export interface TypographyProps extends Omit<TextProps, 'style'> {
  /** The typography variant to apply (e.g., 'heading1', 'body', 'caption') */
  variant?: string;
  /** Custom color to override the typography color, or false to disable color */
  color?: string | false;
  /** Additional styles to apply to the text */
  style?: StyledProp<TextStyle>;
  /** Styled props for advanced styling with theme and responsive support */
  styled?: StyledProps<TextProps>;
  /** Whether the text should be selectable by the user */
  selectable?: boolean;
}

/**
 * Typography component that provides consistent text styling with theme and responsive support.
 * This component automatically applies typography styles based on the configured typography system.
 * 
 * @param props - The component props
 * @param props.variant - The typography variant to apply
 * @param props.color - Custom color override
 * @param props.style - Additional styles
 * @param props.styled - Styled props for advanced styling
 * @param props.selectable - Whether text should be selectable
 * @param props.children - The text content
 * 
 * @example
 * ```tsx
 * import { Typography } from '@mapples/style';
 * 
 * const MyComponent = () => {
 *   return (
 *     <View>
 *       <Typography variant="heading1">Main Title</Typography>
 *       <Typography variant="body" color="theme.colors.primary">
 *         Body text with custom color
 *       </Typography>
 *       <Typography selectable>
 *         Selectable text content
 *       </Typography>
 *     </View>
 *   );
 * };
 * ```
 */
const Typography = forwardRef<Text, TypographyProps>(
  ({ variant, color, style, selectable, styled, ...props }, ref) => {
    const { getTypographyStyle } = useTypography();

    const textStyle = useMemo(() => {
      return getTypographyStyle(variant);
    }, [getTypographyStyle, variant]);

    return (
      <StyledText
        ref={ref}
        styled={{
          ...styled,
          style: [
            styler.text,
            selectable && styler.selectable,
            textStyle,
            !!color && { color: color },
            Styler.flatten([style, styled?.style]),
          ],
        }}
        {...props}
      />
    );
  },
);
Typography.displayName = 'Typography';

const styler = Styler.create({
  text: {
    userSelect: 'none',
  },
  selectable: {
    userSelect: 'text',
  },
});

export default Typography;
