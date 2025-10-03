import { ComponentType, forwardRef, PropsWithChildren } from 'react';

import {
  styled as makeStyled,
  StyledProp,
  StyledProps,
  StyledView,
  Styler,
  WithStyledProps,
} from '@mapples/style';
import { SvgSource } from '@mapples/types';
import { TextStyle, View, ViewProps } from 'react-native';
import { SvgUri, SvgProps } from 'react-native-svg';

import MockIcon from './MockIcon';

export type IconProps = PropsWithChildren<
  Omit<WithStyledProps<ViewProps>, 'styled'> & {
    styled?: StyledProps<ViewProps> & {
      styleSvg?: StyledProp<TextStyle>;
    };
  }
> & {
  uri?: string | SvgSource;
};

const StyledSvgUri = makeStyled(SvgUri);

const Icon = forwardRef<View, PropsWithChildren<IconProps>>(
  ({ styled, uri, ...props }, ref) => {
    const { styleSvg, ...styledViewProps } = styled || {};

    const ejectStyle = Styler.flatten(styleSvg);

    const getUriComponent = (Uri: { default: ComponentType<SvgProps> }) => {
      const StyledSvg = makeStyled(Uri.default);

      return (
        <StyledSvg
          styled={{
            width: ejectStyle?.width as string | number,
            height: ejectStyle?.height as string | number,
            color: ejectStyle?.color,
            style: styleSvg,
          }}
        />
      );
    };

    return (
      <StyledView ref={ref} styled={styledViewProps} {...props}>
        {uri ? (
          <>
            {typeof uri === 'string' ? (
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
              getUriComponent(uri)
            )}
          </>
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
