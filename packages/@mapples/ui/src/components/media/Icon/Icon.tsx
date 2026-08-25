import { ComponentType, forwardRef, PropsWithChildren } from 'react';

import {
  styled as makeStyled,
  StyledProp,
  StyledProps,
  SvgStyle,
  StyledView,
  Styler,
  WithStyledProps,
} from '@mapples/style';
import { SvgSource } from '@mapples/types';
import { View, ViewProps } from 'react-native';
import { SvgUri, SvgProps } from 'react-native-svg';

import MockIcon from './MockIcon';

/**
 * Props for the Icon component.
 *
 * @public
 */
export type IconProps = PropsWithChildren<
  Omit<WithStyledProps<ViewProps>, 'styled'> & {
    /** Styling configuration for the icon container and SVG */
    styled?: StyledProps<ViewProps> & {
      /** SVG-specific styling (width, height, color) */
      styleSvg?: StyledProp<SvgStyle>;
    };
  }
> & {
  /** URI of the SVG icon — either a remote URL string or a local `SvgSource` module reference */
  uri?: string | SvgSource;
};

const StyledSvgUri = makeStyled(SvgUri);

/**
 * Renders an SVG icon from a URI or falls back to a placeholder `MockIcon`.
 *
 * Accepts either a remote URL string or a local `SvgSource` module reference
 * via the `uri` prop. When no `uri` is provided the `MockIcon` placeholder is
 * shown instead, which is useful during development or when the icon asset is
 * optional.
 *
 * @example
 * ```tsx
 * // Remote URL
 * <Icon
 *   uri="https://example.com/icon.svg"
 *   styled={{ styleSvg: { width: 24, height: 24, color: '#333' } }}
 * />
 *
 * // Local SVG module
 * import MyIcon from './my-icon.svg';
 * <Icon uri={MyIcon} styled={{ styleSvg: { width: 24, height: 24 } }} />
 * ```
 *
 * @public
 */
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
