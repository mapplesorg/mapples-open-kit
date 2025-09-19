import { forwardRef, PropsWithChildren } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledProps,
  Typography,
} from '@mapples/style';
import { PressableProps, TextStyle, View } from 'react-native';

export interface ButtonProps extends PressableProps {
  label?: string;
  styled?: StyledProps<PressableProps> & {
    styleTypography?: StyledProp<TextStyle>;
  };
  typographyVariant?: string;
}

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
