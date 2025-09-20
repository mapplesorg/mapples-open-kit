import { ComponentType, forwardRef } from 'react';

import { useStyled } from '../hooks';
import { WithStyledProps } from '../types';

const styled = <T extends object>(Component: ComponentType<T>) => {
  const ComponentWithRef = forwardRef<unknown, WithStyledProps<T>>(
    ({ styled, ...props }, ref) => {
      const styledProps = useStyled(styled);

      return <Component ref={ref} {...(props as T)} {...styledProps} />;
    },
  );
  ComponentWithRef.displayName = `Styled(${Component.displayName})`;
  return ComponentWithRef;
};

export default styled;
