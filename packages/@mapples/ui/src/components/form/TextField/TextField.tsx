import { forwardRef, PropsWithChildren } from 'react';

import { useFormField } from '@mapples/form';
import { StyledTextInput } from '@mapples/style';
import { TextInputProps, TextInput } from 'react-native';

export interface TextFieldProps extends Omit<TextInputProps, 'onChangeText'> {
  fieldName?: string;
}

/**
 * A customizable text input component with built-in styling support.
 *
 * The TextField component extends React Native's TextInput with additional styling
 * capabilities through the @mapples/style system. It supports all standard
 * TextField properties and behaviors.
 *
 * @example
 * ```tsx
 * <TextField
 *   placeholder="Enter your text"
 *   value={text}
 *   onChangeText={setText}
 *   styled={{
 *     style: {
 *       borderWidth: 1,
 *       borderColor: 'gray',
 *       padding: 12,
 *       borderRadius: 8
 *     }
 *   }}
 * />
 * ```
 *
 * @public
 */
const TextField = forwardRef<TextInput, PropsWithChildren<TextFieldProps>>(
  ({ children, fieldName, ...props }, ref) => {
    const { value, setValue } = useFormField<string>(
      fieldName || 'unknown',
      '',
      true,
    );

    return (
      <StyledTextInput
        ref={ref}
        {...props}
        value={value || ''}
        onChangeText={setValue}
      />
    );
  },
);
TextField.displayName = 'TextField';

export default TextField;
