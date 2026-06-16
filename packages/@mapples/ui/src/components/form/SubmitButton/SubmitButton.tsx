import { forwardRef, PropsWithChildren } from 'react';

import { useFormSubmit } from '@mapples/form';
import {
  StyledPressable,
  StyledProp,
  StyledProps,
  Typography,
} from '@mapples/style';
import { PressableProps, TextStyle, View } from 'react-native';

/**
 * Props for the SubmitButton component.
 *
 * @public
 */
export interface SubmitButtonProps extends PressableProps {
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
 * The SubmitButton component extends React Native's Pressable with additional styling
 * capabilities and typography support. It can display a text label and supports
 * all standard pressable interactions.
 *
 * @example
 * ```tsx
 * <SubmitButton
 *   label="Click me"
 *   styled={{
 *     style: { backgroundColor: 'blue', padding: 16 },
 *     styleTypography: { color: 'white', fontSize: 16 }
 *   }}
 * />
 * ```
 *
 * @public
 */
const SubmitButton = forwardRef<View, PropsWithChildren<SubmitButtonProps>>(
  ({ label, styled = {}, typographyVariant, ...props }, ref) => {
    const { styleTypography, ...styledPressableProps } = styled;
    const { submitForm } = useFormSubmit();

    return (
      <StyledPressable
        ref={ref}
        styled={styledPressableProps}
        {...props}
        onPress={submitForm}
      >
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
SubmitButton.displayName = 'SubmitButton';

export default SubmitButton;
