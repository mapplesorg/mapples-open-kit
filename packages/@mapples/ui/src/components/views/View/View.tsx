import { forwardRef, PropsWithChildren } from 'react';

import { StyledView, WithStyledProps } from '@mapples/style';
import { ViewProps as RNViewProps } from 'react-native';

export type ViewProps = PropsWithChildren<WithStyledProps<RNViewProps>>;

const View = forwardRef(({ styled, children, ...props }: ViewProps, ref) => {
  return (
    <StyledView ref={ref} styled={{ ...styled }} {...props}>
      {children}
    </StyledView>
  );
});
View.displayName = 'View';

export default View;
