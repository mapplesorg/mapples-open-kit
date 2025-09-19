import { forwardRef, PropsWithChildren } from 'react';

import { StyledTextInput } from '@mapples/style';
import { TextInputProps, TextInput as RNTextInput } from 'react-native';

const TextInput = forwardRef<RNTextInput, PropsWithChildren<TextInputProps>>(
  ({ children, ...props }, ref) => {
    return <StyledTextInput ref={ref} {...props} />;
  },
);
TextInput.displayName = 'TextInput';

export default TextInput;
