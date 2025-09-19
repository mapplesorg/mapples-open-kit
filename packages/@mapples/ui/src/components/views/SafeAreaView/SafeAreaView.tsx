import { forwardRef, PropsWithChildren } from 'react';

import { StyledSafeAreaView, WithStyledProps } from '@mapples/style';
import { SafeAreaViewProps as RNSafeAreaViewProps } from 'react-native-safe-area-context';

export type SafeAreaViewProps = PropsWithChildren<
  WithStyledProps<RNSafeAreaViewProps>
>;

const SafeAreaView = forwardRef(
  ({ styled, children, ...props }: SafeAreaViewProps, ref) => {
    return (
      <StyledSafeAreaView ref={ref} styled={{ ...styled }} {...props}>
        {children}
      </StyledSafeAreaView>
    );
  },
);
SafeAreaView.displayName = 'SafeAreaView';

export default SafeAreaView;
