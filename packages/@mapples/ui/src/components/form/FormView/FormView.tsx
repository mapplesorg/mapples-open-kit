import { forwardRef, PropsWithChildren } from 'react';

import { Form } from '@mapples/form';
import { StyledView, WithStyledProps } from '@mapples/style';
import { isObject } from 'lodash';
import { ViewProps } from 'react-native';

/**
 * Props for the Form View component.
 *
 * @public
 */
export type FormViewProps = PropsWithChildren<WithStyledProps<ViewProps>> & {
  initialValues?: any;
  onSubmit?: (values: any) => void;
};

/**
 * A customizable view component with built-in styling support.
 *
 * The View component extends React Native's View with additional styling
 * capabilities through the @mapples/style system. It serves as a container
 * for other UI elements and supports all standard view properties.
 *
 * @example
 * ```tsx
 * <FormView
 *   styled={{
 *     style: {
 *       backgroundColor: 'lightblue',
 *       padding: 16,
 *       borderRadius: 8
 *     }
 *   }}
 * >
 *   <Text>Content inside the view</Text>
 * </View>
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
