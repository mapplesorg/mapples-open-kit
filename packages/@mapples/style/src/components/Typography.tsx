import { forwardRef, useMemo } from 'react';

import { TextProps, TextStyle, Text } from 'react-native';

import { useTypography } from '../hooks';
import { StyledProp, StyledProps } from '../types';
import { Styler } from '../utils';

import { StyledText } from './styled';

export interface TypographyProps extends Omit<TextProps, 'style'> {
  variant?: string;
  color?: string | false;
  style?: StyledProp<TextStyle>;
  styled?: StyledProps<TextProps>;
  selectable?: boolean;
}

const Typography = forwardRef<Text, TypographyProps>(
  ({ variant, color, style, selectable, styled, ...props }, ref) => {
    const { getTypographyStyle } = useTypography();

    const textStyle = useMemo(() => {
      return getTypographyStyle(variant);
    }, [getTypographyStyle, variant]);

    return (
      <StyledText
        ref={ref}
        styled={{
          ...styled,
          style: [
            styler.text,
            selectable && styler.selectable,
            textStyle,
            !!color && { color: color },
            Styler.flatten([style, styled?.style]),
          ],
        }}
        {...props}
      />
    );
  },
);
Typography.displayName = 'Typography';

const styler = Styler.create({
  text: {
    userSelect: 'none',
  },
  selectable: {
    userSelect: 'text',
  },
});

export default Typography;
