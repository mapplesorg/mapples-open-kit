import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useState,
  type ComponentRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react';

import { StyledTextInput } from '@mapples/style';
import { TextInputProps, TextInput as RNTextInput } from 'react-native';

/**
 * A customizable text input component with built-in styling support.
 *
 * The TextInput component extends React Native's TextInput with additional styling
 * capabilities through the @mapples/style system. It supports all standard
 * TextInput properties and behaviors.
 *
 * The text is always passed to the native input as a string: while `value` is
 * undefined the component keeps the typed text itself, so a data binding that
 * resolves later (page variables register after the first render) does not
 * flip the input from uncontrolled to controlled.
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
// Annotated so the emitted type names the instance through `ComponentRef`:
// React Native 0.88's TextInput instance type is not exported.
const TextInput: ForwardRefExoticComponent<
  PropsWithChildren<TextInputProps> &
    RefAttributes<ComponentRef<typeof RNTextInput>>
> = forwardRef<
  ComponentRef<typeof RNTextInput>,
  PropsWithChildren<TextInputProps>
>(({ children, value, defaultValue, onChangeText, ...props }, ref) => {
  const [internal, setInternal] = useState(defaultValue ?? '');
  const controlled = value !== undefined;

  const handleChangeText = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      onChangeText?.(next);
    },
    [controlled, onChangeText],
  );

  return (
    <StyledTextInput
      ref={ref}
      {...props}
      value={controlled ? value : internal}
      onChangeText={handleChangeText}
    />
  );
});
TextInput.displayName = 'TextInput';

export default TextInput;
