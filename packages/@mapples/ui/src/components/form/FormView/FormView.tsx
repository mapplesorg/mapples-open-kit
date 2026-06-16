import { forwardRef, PropsWithChildren } from 'react';

import { Form } from '@mapples/form';
import { StyledView, WithStyledProps } from '@mapples/style';
import { isObject } from 'lodash';
import { ViewProps } from 'react-native';

/**
 * Props for the FormView component.
 *
 * @public
 */
export type FormViewProps = PropsWithChildren<WithStyledProps<ViewProps>> & {
  /** Initial field values passed to the underlying form context. */
  initialValues?: any;
  /** Callback invoked with the form's collected values when the form is submitted. */
  onSubmit?: (values: any) => void;
};

/**
 * A form container component that provides a shared form context to its children.
 *
 * Wraps React Native's View with the `@mapples/form` Form provider, enabling
 * nested fields (such as {@link TextField}) and submit controls (such as
 * {@link SubmitButton}) to participate in a single form lifecycle. Additional
 * styling is applied via the `@mapples/style` styled-props system.
 *
 * @example
 * ```tsx
 * <FormView
 *   initialValues={{ email: '' }}
 *   onSubmit={(values) => console.log(values)}
 *   styled={{
 *     style: {
 *       padding: 16,
 *       gap: 12,
 *     }
 *   }}
 * >
 *   <TextField fieldName="email" placeholder="Email" />
 *   <SubmitButton label="Submit" />
 * </FormView>
 * ```
 *
 * @public
 */
const FormView = forwardRef(
  (
    { styled, children, initialValues, onSubmit, ...props }: FormViewProps,
    ref,
  ) => {
    return (
      <Form
        initialValues={isObject(initialValues) ? initialValues : {}}
        onSubmit={onSubmit}
      >
        <StyledView ref={ref} styled={{ ...styled }} {...props}>
          {children}
        </StyledView>
      </Form>
    );
  },
);
FormView.displayName = 'FormView';

export default FormView;
