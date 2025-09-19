import { forwardRef, PropsWithChildren } from 'react';

import {
  WithStyledProps,
  Typography as StyledTypography,
} from '@mapples/style';
import { isNumber, isString } from 'lodash';
import { TextProps as RNTextProps, Text } from 'react-native';

export type TextProps = PropsWithChildren<
  WithStyledProps<RNTextProps> & {
    text?: string;
  }
>;

const Typography = forwardRef<Text, TextProps>(
  ({ styled, children, text, ...props }, ref) => {
    return (
      <StyledTypography
        ref={ref}
        style={styled?.style}
        styled={styled}
        {...props}
      >
        {isString(text) || isNumber(text) ? text.toString() : 'Not a string'}
      </StyledTypography>
    );
  },
);
Typography.displayName = 'Text';

export default Typography;
