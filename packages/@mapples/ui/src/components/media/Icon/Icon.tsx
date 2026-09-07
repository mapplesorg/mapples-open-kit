import { forwardRef, PropsWithChildren } from 'react';

import {
  StyledProp,
  StyledProps,
  StyledView,
  Styler,
  SvgStyle,
  useStyle,
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
  /**
   * Icon family override for direct (chrome/chat) use. Canvas elements leave
   * this unset — the family then comes from the project style config
   * (`themeConfig.icons.family`), set in the styles modal.
   */
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
 * families. The family comes from the project style config
 * (`themeConfig.icons.family`) unless overridden per instance via `iconStyle`;
 * the glyph is selected by `iconName`. Without a family or a name the
 * `MockIcon` placeholder is shown; a family whose package is not installed
 * (every pack is an optional peer) throws.
 *
 * @example
 * ```tsx
 * // Canvas usage — family from the project style config
 * <Icon
 *   iconName="star"
 *   styled={{ styleSvg: { width: 24, height: 24, color: '#333' } }}
 * />
 *
 * // Direct usage — chrome/chat surfaces pin the family
 * <Icon iconStyle="ionicons" iconName="close" size={14} color="theme.text.tertiary" />
 * ```
 *
 * @public
 */
const Icon = forwardRef<View, PropsWithChildren<IconProps>>(
  ({ styled, iconStyle, iconName, size, color, ...props }, ref) => {
    const { themeConfig } = useStyle();
    const { styleSvg, ...styledViewProps } = styled || {};

    const ejectStyle = Styler.flatten(styleSvg);
    const familyKey = iconStyle ?? themeConfig.icons?.family;
    const family = familyKey
      ? IconFamilies[familyKey as IconFamilyKey]
      : undefined;
    if (family && !family.installed) {
      // The project selected a family whose package isn't installed — a
      // configuration error, not a missing glyph: surface it instead of
      // drawing the placeholder.
      throw new Error(
        `Icon family "${family.key}" is not installed: add ${family.npm} to ` +
          'the project (Project settings → Packages) to render it.',
      );
    }

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
