import { forwardRef, PropsWithChildren } from 'react';

import { StyledText, WithStyledProps } from '@mapples/style';
import { isNumber, isString } from 'lodash';
import { TextProps as RNTextProps } from 'react-native';

export type TextProps = PropsWithChildren<
  WithStyledProps<RNTextProps> & {
    text?: string;
  }
>;

const Text = forwardRef(
  ({ styled, children, text, ...props }: TextProps, ref) => {
    return (
      <StyledText ref={ref} styled={{ ...styled }} {...props}>
        {isString(text) || isNumber(text) ? text.toString() : 'Not a string'}
      </StyledText>
    );
  },
);
Text.displayName = 'Text';

export default Text;
