import { forwardRef, PropsWithChildren } from 'react';

import {
  styled,
  StyledPressable,
  StyledProp,
  StyledProps,
  Styler,
  WithStyledProps,
} from '@mapples/style';
import { PressableProps, TextStyle, View, ViewProps } from 'react-native';
import { SvgUri } from 'react-native-svg';

import MockIcon from './MockIcon';

export type IconProps = PropsWithChildren<
  Omit<WithStyledProps<PressableProps>, 'styled'> & {
    styled?: StyledProps<ViewProps> & {
      styleSvg?: StyledProp<TextStyle>;
    };
  }
> & {
  uri?: string;
};

const StyledSvgUri = styled(SvgUri);

const IconButton = forwardRef<View, PropsWithChildren<IconProps>>(
  ({ styled, uri, ...props }, ref) => {
    const { styleSvg, ...styledViewProps } = styled || {};

    const ejectStyle = Styler.flatten(styleSvg);

    return (
      <StyledPressable ref={ref} styled={styledViewProps} {...props}>
        {uri ? (
          <StyledSvgUri
            uri={uri}
            styled={{
              width: ejectStyle?.width as string | number,
              height: ejectStyle?.height as string | number,
              color: ejectStyle?.color,
              style: styleSvg,
            }}
          />
        ) : (
          <MockIcon
            styled={{
              width: ejectStyle?.width as string | number,
              height: ejectStyle?.height as string | number,
              color: ejectStyle?.color,
              style: styleSvg,
            }}
          />
        )}
      </StyledPressable>
    );
  },
);
IconButton.displayName = 'IconButton';

export default IconButton;
