import { ComponentType, forwardRef, PropsWithChildren } from 'react';

import {
  styled as makeStyled,
  styled,
  StyledPressable,
  StyledProp,
  StyledProps,
  SvgStyle,
  Styler,
  WithStyledProps,
} from '@mapples/style';
import { SvgSource } from '@mapples/types';
import { PressableProps, View, ViewProps } from 'react-native';
import { SvgProps, SvgUri } from 'react-native-svg';

import MockIcon from './MockIcon';

/**
 * Props for the IconButton component.
 *
 * @public
 */
export type IconProps = PropsWithChildren<
  Omit<WithStyledProps<PressableProps>, 'styled'> & {
    /** Styling configuration for the button container and SVG icon */
    styled?: StyledProps<ViewProps> & {
      /** SVG-specific styling */
      styleSvg?: StyledProp<SvgStyle>;
    };
  }
> & {
  /** URI for the SVG icon to display */
  uri?: string | SvgSource;
};

const StyledSvgUri = styled(SvgUri);

/**
 * A customizable icon button component with SVG support.
 *
 * The IconButton component displays an SVG icon that can be pressed.
 * It supports both remote SVG URIs and fallback mock icons, with
 * comprehensive styling support for both the button container and the icon.
 *
 * @example
 * ```tsx
 * <IconButton
 *   uri="https://example.com/icon.svg"
 *   onPress={() => console.log('Icon pressed')}
 *   styled={{
 *     style: {
 *       width: 48,
 *       height: 48,
 *       backgroundColor: 'lightblue',
 *       borderRadius: 24,
 *     },
 *     styleSvg: {
 *       width: 24,
 *       height: 24,
 *       color: 'blue',
 *     },
 *   }}
 * />
 * ```
 *
 * @public
 */
const IconButton = forwardRef<View, PropsWithChildren<IconProps>>(
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
      <StyledPressable ref={ref} styled={styledViewProps} {...props}>
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
      </StyledPressable>
    );
  },
);
IconButton.displayName = 'IconButton';

export default IconButton;
