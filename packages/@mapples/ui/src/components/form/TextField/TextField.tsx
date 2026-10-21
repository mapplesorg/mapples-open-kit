import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react';

import { useFormField } from '@mapples/form';
import { StyledTextInput } from '@mapples/style';
import { TextInputProps, TextInput } from 'react-native';

/**
 * Props for the TextField component.
 *
 * Extends React Native's `TextInputProps`, omitting `onChangeText` because the
 * component manages value changes internally via the form context.
 *
 * @public
 */
export interface TextFieldProps extends Omit<TextInputProps, 'onChangeText'> {
  /** The form field name used to read and write the value in the form context. */
  fieldName?: string;
}

/**
 * A form-connected text input component.
 *
 * Reads and writes its value through the nearest {@link FormView} form context
 * using `fieldName`. `onChangeText` is managed internally; do not pass it as a
 * prop. All other standard `TextInputProps` (e.g. `placeholder`, `secureTextEntry`)
 * are forwarded to the underlying `StyledTextInput`.
 *
 * @example
 * ```tsx
 * <FormView initialValues={{ username: '' }} onSubmit={console.log}>
 *   <TextField
 *     fieldName="username"
 *     placeholder="Enter your username"
 *   />
 *   <SubmitButton label="Submit" />
 * </FormView>
 * ```
 *
 * @public
 */
// Annotated so the emitted type names the instance through `ComponentRef`:
// React Native 0.88's TextInput instance type is not exported.
const TextField: ForwardRefExoticComponent<
  PropsWithChildren<TextFieldProps> &
    RefAttributes<ComponentRef<typeof TextInput>>
> = forwardRef<
  ComponentRef<typeof TextInput>,
  PropsWithChildren<TextFieldProps>
>(({ children, fieldName, ...props }, ref) => {
  const { value, setValue } = useFormField<string>(fieldName || 'unknown');

  return (
    <StyledTextInput
      ref={ref}
      {...props}
      value={value || ''}
      onChangeText={setValue}
    />
  );
});
TextField.displayName = 'TextField';

export default TextField;
