import { forwardRef, PropsWithChildren } from 'react';

import { useFormSubmit } from '@mapples/form';
import { View } from 'react-native';

import Button, { ButtonProps } from '../../inputs/Button/Button';

/**
 * Props for the SubmitButton component — every `Button` prop except
 * `onPress`, which the form owns.
 *
 * @public
 */
export type SubmitButtonProps = Omit<ButtonProps, 'onPress'>;

/**
 * A `Button` that submits the nearest `FormView`. Shares every appearance
 * prop with `Button` (`variant`, `size`, `tone`, glyphs, `fullWidth`); while
 * the form is submitting it shows the loading state unless `loading` is set
 * explicitly.
 *
 * @example
 * ```tsx
 * <FormView initialValues={{ email: '' }} onSubmit={signIn}>
 *   <TextField fieldName="email" placeholder="Email" />
 *   <SubmitButton label="Sign in" variant="filled" size="lg" fullWidth />
 * </FormView>
 * ```
 *
 * @public
 */
const SubmitButton = forwardRef<View, PropsWithChildren<SubmitButtonProps>>(
  ({ loading, ...props }, ref) => {
    const { submitForm, submitting } = useFormSubmit();

    return (
      <Button
        ref={ref}
        loading={loading ?? submitting}
        {...props}
        onPress={submitForm}
      />
    );
  },
);
SubmitButton.displayName = 'SubmitButton';

export default SubmitButton;
