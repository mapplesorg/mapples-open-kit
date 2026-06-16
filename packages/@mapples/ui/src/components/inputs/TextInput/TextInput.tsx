import { forwardRef, PropsWithChildren } from 'react';

import { StyledTextInput } from '@mapples/style';
import { TextInputProps, TextInput as RNTextInput } from 'react-native';

/**
 * A customizable text input component with built-in styling support.
 *
 * The TextInput component extends React Native's TextInput with additional styling
 * capabilities through the @mapples/style system. It supports all standard
 * TextInput properties and behaviors.
 *
 * @example
 * ```tsx
 * <TextInput
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
const TextInput = forwardRef<RNTextInput, PropsWithChildren<TextInputProps>>(
  ({ children, ...props }, ref) => {
    return <StyledTextInput ref={ref} {...props} />;
  },
);
TextInput.displayName = 'TextInput';

export default TextInput;
