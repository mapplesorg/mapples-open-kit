import { ComponentType, forwardRef } from 'react';

import { useStyled } from '../hooks';
import useStyledProps from '../hooks/useStyledProps';
import { WithStyledProps } from '../types';

const styled = <T extends object>(Component: ComponentType<T>) => {
  const ComponentWithRef = forwardRef<unknown, WithStyledProps<T>>(
    ({ styled, ...props }, ref) => {
      const styledProps = useStyledProps(styled);

      return <Component ref={ref} {...(props as T)} {...styledProps} />;
    },
  );
  ComponentWithRef.displayName = `Styled(${Component.displayName})`;
  return ComponentWithRef;
};

export default styled;
