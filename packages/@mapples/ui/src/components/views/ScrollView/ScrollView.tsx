import { forwardRef, PropsWithChildren } from 'react';

import { StyledScrollView, WithStyledProps } from '@mapples/style';
import { ViewProps as RNViewProps } from 'react-native';

export type ViewProps = PropsWithChildren<WithStyledProps<RNViewProps>>;

const ScrollView = forwardRef(
  ({ styled, children, ...props }: ViewProps, ref) => {
    return (
      <StyledScrollView
        showsVerticalScrollIndicator={false}
        ref={ref}
        styled={{ ...styled }}
        {...props}
      >
        {children}
      </StyledScrollView>
    );
  },
);
ScrollView.displayName = 'ScrollView';

export default ScrollView;
