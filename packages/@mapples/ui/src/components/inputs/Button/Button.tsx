import { forwardRef, PropsWithChildren } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledProps,
  Typography,
} from '@mapples/style';
import { PressableProps, TextStyle, View } from 'react-native';

/**
 * Props for the Button component.
 *
 * @public
 */
export interface ButtonProps extends PressableProps {
  /** The text label to display on the button */
  label?: string;
  /** Styling configuration for the button and its typography */
  styled?: StyledProps<PressableProps> & {
    /** Typography-specific styling for the button label */
    styleTypography?: StyledProp<TextStyle>;
  };
  /** Typography variant to apply to the button label */
  typographyVariant?: string;
}

/**
 * A customizable button component with built-in styling support.
 *
 * The Button component extends React Native's Pressable with additional styling
 * capabilities and typography support. It can display a text label and supports
 * all standard pressable interactions.
 *
 * @example
 * ```tsx
 * <Button
 *   label="Click me"
 *   onPress={() => console.log('Button pressed')}
 *   styled={{
 *     style: { backgroundColor: 'blue', padding: 16 },
 *     styleTypography: { color: 'white', fontSize: 16 }
 *   }}
 * />
 * ```
 *
 * @public
 */
const Button = forwardRef<View, PropsWithChildren<ButtonProps>>(
  ({ label, styled = {}, typographyVariant, ...props }, ref) => {
    const { styleTypography, ...styledPressableProps } = styled;

    return (
      <StyledPressable ref={ref} styled={styledPressableProps} {...props}>
        {label && (
          <Typography
            style={styled?.styleTypography}
            variant={typographyVariant}
          >
            {label}
          </Typography>
        )}
      </StyledPressable>
    );
  },
);
Button.displayName = 'Button';

export default Button;
