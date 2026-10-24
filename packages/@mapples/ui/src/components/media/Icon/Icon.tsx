import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

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

import { IconFamilies, IconFamily, IconFamilyKey } from './families';

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

/** `family/glyph` pairs already reported, so a list of rows warns once. */
const reportedMissingGlyphs = new Set<string>();

/**
 * The vector-icons font draws a missing glyph as "?" without a word, so in
 * development name the family and the glyph once.
 */
const warnMissingGlyph = (family: IconFamily, iconName: string): void => {
  if (!__DEV__ || iconName in family.glyphMap) return;
  const key = `${family.key}/${iconName}`;
  if (reportedMissingGlyphs.has(key)) return;
  reportedMissingGlyphs.add(key);
  console.warn(
    `Icon: "${iconName}" is not a glyph of the icon family "${family.key}" — it renders as "?". ` +
      'Use a name from that family, or change the family (theme.icons.family).',
  );
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
const Icon: ForwardRefExoticComponent<
  PropsWithChildren<IconProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<IconProps>>(
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
        `Icon family "${family.key}" needs ${family.npm}. ` +
          'Creator-first app: enable its icon pack in Project settings → ' +
          'Packages. Code-first app: run `mapples sync` (it adds the pack to ' +
          'package.json), then the install command the sync names.',
      );
    }
    if (family && iconName) warnMissingGlyph(family, iconName);

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
