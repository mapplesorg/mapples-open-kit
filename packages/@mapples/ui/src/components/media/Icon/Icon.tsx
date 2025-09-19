import { forwardRef, PropsWithChildren } from 'react';

import {
  styled,
  StyledProp,
  StyledProps,
  StyledView,
  Styler,
  WithStyledProps,
} from '@mapples/style';
import { TextStyle, View, ViewProps } from 'react-native';
import { SvgUri } from 'react-native-svg';

import MockIcon from './MockIcon';

export type IconProps = PropsWithChildren<
  Omit<WithStyledProps<ViewProps>, 'styled'> & {
    styled?: StyledProps<ViewProps> & {
      styleSvg?: StyledProp<TextStyle>;
    };
  }
> & {
  uri?: string;
};

const StyledSvgUri = styled(SvgUri);

const Icon = forwardRef<View, PropsWithChildren<IconProps>>(
  ({ styled, uri, ...props }, ref) => {
    const { styleSvg, ...styledViewProps } = styled || {};

    const ejectStyle = Styler.flatten(styleSvg);

    return (
      <StyledView ref={ref} styled={styledViewProps} {...props}>
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
      </StyledView>
    );
  },
);
Icon.displayName = 'Icon';

export default Icon;
