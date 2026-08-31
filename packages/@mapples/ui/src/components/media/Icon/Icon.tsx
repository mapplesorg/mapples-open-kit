import { forwardRef, PropsWithChildren } from 'react';

import {
  StyledProp,
  StyledProps,
  StyledView,
  Styler,
  SvgStyle,
  WithStyledProps,
} from '@mapples/style';
import {
  ColorValue,
  StyleProp,
  TextStyle,
  View,
  ViewProps,
} from 'react-native';

import MockIcon from '../Vector/MockIcon';

import { IconFamilies, IconFamilyKey } from './families';

/**
 * Props for the Icon component.
 *
 * @public
 */
export type IconProps = PropsWithChildren<
  Omit<WithStyledProps<ViewProps>, 'styled'> & {
    /** Styling configuration for the icon container and glyph */
    styled?: StyledProps<ViewProps> & {
      /** Glyph-specific styling (width, height, color) */
      styleSvg?: StyledProp<SvgStyle>;
    };
  }
> & {
  /** Icon family the glyph is drawn from */
  iconStyle?: IconFamilyKey;
  /** Glyph name within the selected family */
  iconName?: string;
  /** Glyph font size — overrides the `styleSvg` width for direct use */
  size?: number;
  /** Glyph color — theme tokens allowed, overrides the `styleSvg` color */
  color?: ColorValue;
};

/**
 * Renders a font glyph from one of the bundled `@react-native-vector-icons`
 * families, selected by `iconStyle` (family) and `iconName` (glyph). Until
 * both are set the `MockIcon` placeholder is shown.
 *
 * @example
 * ```tsx
 * // Canvas usage — sized and colored through styleSvg
 * <Icon
 *   iconStyle="ionicons"
 *   iconName="star"
 *   styled={{ styleSvg: { width: 24, height: 24, color: '#333' } }}
 * />
 *
 * // Direct usage — chrome/chat surfaces
 * <Icon iconStyle="ionicons" iconName="close" size={14} color="theme.text.tertiary" />
 * ```
 *
 * @public
 */
const Icon = forwardRef<View, PropsWithChildren<IconProps>>(
  ({ styled, iconStyle, iconName, size, color, ...props }, ref) => {
    const { styleSvg, ...styledViewProps } = styled || {};

    const ejectStyle = Styler.flatten(styleSvg);
    const family = iconStyle ? IconFamilies[iconStyle] : undefined;

    return (
      <StyledView ref={ref} styled={styledViewProps} {...props}>
        {family && iconName ? (
          <family.Component
            name={iconName}
            styled={{
              size: size ?? (ejectStyle?.width as number),
              color: color ?? ejectStyle?.color,
              style: styleSvg as StyledProp<StyleProp<TextStyle>>,
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
