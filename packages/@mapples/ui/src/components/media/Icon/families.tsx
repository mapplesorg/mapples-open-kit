import { ComponentProps, ComponentType } from 'react';

import { styled, WithStyledProps } from '@mapples/style';
import AntDesign from '@react-native-vector-icons/ant-design';
import antDesignGlyphs from '@react-native-vector-icons/ant-design/glyphmaps/AntDesign.json';
import Entypo from '@react-native-vector-icons/entypo';
import entypoGlyphs from '@react-native-vector-icons/entypo/glyphmaps/Entypo.json';
import EvilIcons from '@react-native-vector-icons/evil-icons';
import evilIconsGlyphs from '@react-native-vector-icons/evil-icons/glyphmaps/EvilIcons.json';
import Feather from '@react-native-vector-icons/feather';
import featherGlyphs from '@react-native-vector-icons/feather/glyphmaps/Feather.json';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import fontAwesomeGlyphs from '@react-native-vector-icons/fontawesome/glyphmaps/FontAwesome.json';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import fontAwesome5BrandGlyphs from '@react-native-vector-icons/fontawesome5/glyphmaps/FontAwesome5_brand.json';
import fontAwesome5RegularGlyphs from '@react-native-vector-icons/fontawesome5/glyphmaps/FontAwesome5_regular.json';
import fontAwesome5SolidGlyphs from '@react-native-vector-icons/fontawesome5/glyphmaps/FontAwesome5_solid.json';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import fontAwesome6BrandGlyphs from '@react-native-vector-icons/fontawesome6/glyphmaps/FontAwesome6_brand.json';
import fontAwesome6RegularGlyphs from '@react-native-vector-icons/fontawesome6/glyphmaps/FontAwesome6_regular.json';
import fontAwesome6SolidGlyphs from '@react-native-vector-icons/fontawesome6/glyphmaps/FontAwesome6_solid.json';
import Fontisto from '@react-native-vector-icons/fontisto';
import fontistoGlyphs from '@react-native-vector-icons/fontisto/glyphmaps/Fontisto.json';
import Foundation from '@react-native-vector-icons/foundation';
import foundationGlyphs from '@react-native-vector-icons/foundation/glyphmaps/Foundation.json';
import Ionicons from '@react-native-vector-icons/ionicons';
import ioniconsGlyphs from '@react-native-vector-icons/ionicons/glyphmaps/Ionicons.json';
import Lucide from '@react-native-vector-icons/lucide';
import lucideGlyphs from '@react-native-vector-icons/lucide/glyphmaps/Lucide.json';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import materialDesignIconsGlyphs from '@react-native-vector-icons/material-design-icons/glyphmaps/MaterialDesignIcons.json';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import materialIconsGlyphs from '@react-native-vector-icons/material-icons/glyphmaps/MaterialIcons.json';
import Octicons from '@react-native-vector-icons/octicons';
import octiconsGlyphs from '@react-native-vector-icons/octicons/glyphmaps/Octicons.json';
import SimpleLineIcons from '@react-native-vector-icons/simple-line-icons';
import simpleLineIconsGlyphs from '@react-native-vector-icons/simple-line-icons/glyphmaps/SimpleLineIcons.json';
import Zocial from '@react-native-vector-icons/zocial';
import zocialGlyphs from '@react-native-vector-icons/zocial/glyphmaps/Zocial.json';
import { ColorValue, StyleProp, TextStyle } from 'react-native';

/**
 * Uniform props every icon-family glyph component accepts.
 *
 * @public
 */
export interface IconGlyphProps {
  /** Glyph name within the family */
  name: string;
  /** Font size of the glyph */
  size?: number;
  /** Glyph color */
  color?: ColorValue;
  /** Additional text styling */
  style?: StyleProp<TextStyle>;
}

/**
 * Map of glyph name to codepoint for one icon family.
 *
 * @public
 */
export type IconGlyphMap = Record<string, number | string>;

/**
 * Persisted identifier of an icon family. FontAwesome 5/6 expose one entry per
 * variant so the `Icon` component API stays at exactly two props
 * (`iconStyle` + `iconName`).
 *
 * @public
 */
export type IconFamilyKey =
  | 'ant-design'
  | 'entypo'
  | 'evil-icons'
  | 'feather'
  | 'fontawesome'
  | 'fontawesome5-solid'
  | 'fontawesome5-regular'
  | 'fontawesome5-brands'
  | 'fontawesome6-solid'
  | 'fontawesome6-regular'
  | 'fontawesome6-brands'
  | 'fontisto'
  | 'foundation'
  | 'ionicons'
  | 'lucide'
  | 'material-design-icons'
  | 'material-icons'
  | 'octicons'
  | 'simple-line-icons'
  | 'zocial';

/**
 * One registered icon family: its persisted key, human label, styled()-wrapped
 * glyph component, and glyph map (used by editor pickers for name lists and
 * previews).
 *
 * @public
 */
export interface IconFamily {
  key: IconFamilyKey;
  label: string;
  Component: ComponentType<WithStyledProps<IconGlyphProps>>;
  glyphMap: IconGlyphMap;
}

// Documents persist glyph names as plain strings, so the per-family literal
// name unions (~30k strings across all families) are erased here — this is the
// single place that cast lives.
const glyphComponent = (Family: ComponentType<never>) =>
  styled(Family as ComponentType<IconGlyphProps>);

const fontAwesome5Variant = (iconStyle: 'solid' | 'regular' | 'brand') => {
  const Variant = (props: IconGlyphProps) => (
    <FontAwesome5
      {...({ ...props, iconStyle } as ComponentProps<typeof FontAwesome5>)}
    />
  );
  Variant.displayName = `FontAwesome5.${iconStyle}`;
  return styled(Variant);
};

const fontAwesome6Variant = (iconStyle: 'solid' | 'regular' | 'brand') => {
  const Variant = (props: IconGlyphProps) => (
    <FontAwesome6
      {...({ ...props, iconStyle } as ComponentProps<typeof FontAwesome6>)}
    />
  );
  Variant.displayName = `FontAwesome6.${iconStyle}`;
  return styled(Variant);
};

/**
 * Registry of every bundled icon family, keyed by the persisted
 * {@link IconFamilyKey}.
 *
 * @public
 */
export const IconFamilies: Record<IconFamilyKey, IconFamily> = {
  'ant-design': {
    key: 'ant-design',
    label: 'AntDesign',
    Component: glyphComponent(AntDesign),
    glyphMap: antDesignGlyphs,
  },
  entypo: {
    key: 'entypo',
    label: 'Entypo',
    Component: glyphComponent(Entypo),
    glyphMap: entypoGlyphs,
  },
  'evil-icons': {
    key: 'evil-icons',
    label: 'EvilIcons',
    Component: glyphComponent(EvilIcons),
    glyphMap: evilIconsGlyphs,
  },
  feather: {
    key: 'feather',
    label: 'Feather',
    Component: glyphComponent(Feather),
    glyphMap: featherGlyphs,
  },
  fontawesome: {
    key: 'fontawesome',
    label: 'FontAwesome',
    Component: glyphComponent(FontAwesome),
    glyphMap: fontAwesomeGlyphs,
  },
  'fontawesome5-solid': {
    key: 'fontawesome5-solid',
    label: 'FontAwesome 5 Solid',
    Component: fontAwesome5Variant('solid'),
    glyphMap: fontAwesome5SolidGlyphs,
  },
  'fontawesome5-regular': {
    key: 'fontawesome5-regular',
    label: 'FontAwesome 5 Regular',
    Component: fontAwesome5Variant('regular'),
    glyphMap: fontAwesome5RegularGlyphs,
  },
  'fontawesome5-brands': {
    key: 'fontawesome5-brands',
    label: 'FontAwesome 5 Brands',
    Component: fontAwesome5Variant('brand'),
    glyphMap: fontAwesome5BrandGlyphs,
  },
  'fontawesome6-solid': {
    key: 'fontawesome6-solid',
    label: 'FontAwesome 6 Solid',
    Component: fontAwesome6Variant('solid'),
    glyphMap: fontAwesome6SolidGlyphs,
  },
  'fontawesome6-regular': {
    key: 'fontawesome6-regular',
    label: 'FontAwesome 6 Regular',
    Component: fontAwesome6Variant('regular'),
    glyphMap: fontAwesome6RegularGlyphs,
  },
  'fontawesome6-brands': {
    key: 'fontawesome6-brands',
    label: 'FontAwesome 6 Brands',
    Component: fontAwesome6Variant('brand'),
    glyphMap: fontAwesome6BrandGlyphs,
  },
  fontisto: {
    key: 'fontisto',
    label: 'Fontisto',
    Component: glyphComponent(Fontisto),
    glyphMap: fontistoGlyphs,
  },
  foundation: {
    key: 'foundation',
    label: 'Foundation',
    Component: glyphComponent(Foundation),
    glyphMap: foundationGlyphs,
  },
  ionicons: {
    key: 'ionicons',
    label: 'Ionicons',
    Component: glyphComponent(Ionicons),
    glyphMap: ioniconsGlyphs,
  },
  lucide: {
    key: 'lucide',
    label: 'Lucide',
    Component: glyphComponent(Lucide),
    glyphMap: lucideGlyphs,
  },
  'material-design-icons': {
    key: 'material-design-icons',
    label: 'Material Design Icons',
    Component: glyphComponent(MaterialDesignIcons),
    glyphMap: materialDesignIconsGlyphs,
  },
  'material-icons': {
    key: 'material-icons',
    label: 'Material Icons',
    Component: glyphComponent(MaterialIcons),
    glyphMap: materialIconsGlyphs,
  },
  octicons: {
    key: 'octicons',
    label: 'Octicons',
    Component: glyphComponent(Octicons),
    glyphMap: octiconsGlyphs,
  },
  'simple-line-icons': {
    key: 'simple-line-icons',
    label: 'Simple Line Icons',
    Component: glyphComponent(SimpleLineIcons),
    glyphMap: simpleLineIconsGlyphs,
  },
  zocial: {
    key: 'zocial',
    label: 'Zocial',
    Component: glyphComponent(Zocial),
    glyphMap: zocialGlyphs,
  },
};
