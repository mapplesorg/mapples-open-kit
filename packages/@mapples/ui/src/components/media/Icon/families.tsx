import { ComponentProps, ComponentType } from 'react';

import { styled, WithStyledProps } from '@mapples/style';
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
 * One registered icon family: its persisted key, human label, the npm package
 * that ships the font, whether that package resolved, the styled()-wrapped
 * glyph component, and the glyph map (used by editor pickers for name lists
 * and previews — empty when the package is not installed).
 *
 * @public
 */
export interface IconFamily {
  key: IconFamilyKey;
  label: string;
  /** The `@react-native-vector-icons/*` package that ships this family. */
  npm: string;
  /** Whether {@link IconFamily.npm} resolved when the bundle was built. */
  installed: boolean;
  Component: ComponentType<WithStyledProps<IconGlyphProps>>;
  glyphMap: IconGlyphMap;
}

/**
 * The npm package behind each icon family. FontAwesome 5/6 variants share one
 * package each.
 *
 * @public
 */
export const ICON_FAMILY_NPM: Record<IconFamilyKey, string> = {
  'ant-design': '@react-native-vector-icons/ant-design',
  entypo: '@react-native-vector-icons/entypo',
  'evil-icons': '@react-native-vector-icons/evil-icons',
  feather: '@react-native-vector-icons/feather',
  fontawesome: '@react-native-vector-icons/fontawesome',
  'fontawesome5-solid': '@react-native-vector-icons/fontawesome5',
  'fontawesome5-regular': '@react-native-vector-icons/fontawesome5',
  'fontawesome5-brands': '@react-native-vector-icons/fontawesome5',
  'fontawesome6-solid': '@react-native-vector-icons/fontawesome6',
  'fontawesome6-regular': '@react-native-vector-icons/fontawesome6',
  'fontawesome6-brands': '@react-native-vector-icons/fontawesome6',
  fontisto: '@react-native-vector-icons/fontisto',
  foundation: '@react-native-vector-icons/foundation',
  ionicons: '@react-native-vector-icons/ionicons',
  lucide: '@react-native-vector-icons/lucide',
  'material-design-icons': '@react-native-vector-icons/material-design-icons',
  'material-icons': '@react-native-vector-icons/material-icons',
  octicons: '@react-native-vector-icons/octicons',
  'simple-line-icons': '@react-native-vector-icons/simple-line-icons',
  zocial: '@react-native-vector-icons/zocial',
};

/**
 * A resolved `@react-native-vector-icons/*` package: its glyph component and
 * the glyph maps it ships (one per FontAwesome variant, otherwise one).
 */
interface IconPack {
  Family: ComponentType<never>;
  glyphs: IconGlyphMap[];
}

/* eslint-disable @typescript-eslint/no-require-imports -- optional peers are resolved lazily below */

/*
 * Every `@react-native-vector-icons/*` package is an **optional peer
 * dependency** of `@mapples/ui`: a project ships only the pack its style
 * config selects (Project settings → Packages), so the others must not be
 * required to build. Each pack is resolved lazily with a `require` that sits
 * lexically inside `try` — Metro (with Expo's `allowOptionalDependencies`)
 * then skips the module when it cannot be resolved instead of failing the
 * bundle. A missing pack is not swallowed: its family is registered as
 * `installed: false` and rendering a glyph from it throws (see
 * {@link missingFamily}), naming the package to add.
 */

let antDesign: IconPack | null = null;
try {
  antDesign = {
    Family: require('@react-native-vector-icons/ant-design').default,
    glyphs: [
      require('@react-native-vector-icons/ant-design/glyphmaps/AntDesign.json'),
    ],
  };
} catch {
  antDesign = null;
}

let entypo: IconPack | null = null;
try {
  entypo = {
    Family: require('@react-native-vector-icons/entypo').default,
    glyphs: [
      require('@react-native-vector-icons/entypo/glyphmaps/Entypo.json'),
    ],
  };
} catch {
  entypo = null;
}

let evilIcons: IconPack | null = null;
try {
  evilIcons = {
    Family: require('@react-native-vector-icons/evil-icons').default,
    glyphs: [
      require('@react-native-vector-icons/evil-icons/glyphmaps/EvilIcons.json'),
    ],
  };
} catch {
  evilIcons = null;
}

let feather: IconPack | null = null;
try {
  feather = {
    Family: require('@react-native-vector-icons/feather').default,
    glyphs: [
      require('@react-native-vector-icons/feather/glyphmaps/Feather.json'),
    ],
  };
} catch {
  feather = null;
}

let fontAwesome: IconPack | null = null;
try {
  fontAwesome = {
    Family: require('@react-native-vector-icons/fontawesome').default,
    glyphs: [
      require('@react-native-vector-icons/fontawesome/glyphmaps/FontAwesome.json'),
    ],
  };
} catch {
  fontAwesome = null;
}

/** Glyph map order for FontAwesome 5/6 packs: solid, regular, brands. */
const FA_SOLID = 0;
const FA_REGULAR = 1;
const FA_BRANDS = 2;

let fontAwesome5: IconPack | null = null;
try {
  fontAwesome5 = {
    Family: require('@react-native-vector-icons/fontawesome5').default,
    glyphs: [
      require('@react-native-vector-icons/fontawesome5/glyphmaps/FontAwesome5_solid.json'),
      require('@react-native-vector-icons/fontawesome5/glyphmaps/FontAwesome5_regular.json'),
      require('@react-native-vector-icons/fontawesome5/glyphmaps/FontAwesome5_brand.json'),
    ],
  };
} catch {
  fontAwesome5 = null;
}

let fontAwesome6: IconPack | null = null;
try {
  fontAwesome6 = {
    Family: require('@react-native-vector-icons/fontawesome6').default,
    glyphs: [
      require('@react-native-vector-icons/fontawesome6/glyphmaps/FontAwesome6_solid.json'),
      require('@react-native-vector-icons/fontawesome6/glyphmaps/FontAwesome6_regular.json'),
      require('@react-native-vector-icons/fontawesome6/glyphmaps/FontAwesome6_brand.json'),
    ],
  };
} catch {
  fontAwesome6 = null;
}

let fontisto: IconPack | null = null;
try {
  fontisto = {
    Family: require('@react-native-vector-icons/fontisto').default,
    glyphs: [
      require('@react-native-vector-icons/fontisto/glyphmaps/Fontisto.json'),
    ],
  };
} catch {
  fontisto = null;
}

let foundation: IconPack | null = null;
try {
  foundation = {
    Family: require('@react-native-vector-icons/foundation').default,
    glyphs: [
      require('@react-native-vector-icons/foundation/glyphmaps/Foundation.json'),
    ],
  };
} catch {
  foundation = null;
}

let ionicons: IconPack | null = null;
try {
  ionicons = {
    Family: require('@react-native-vector-icons/ionicons').default,
    glyphs: [
      require('@react-native-vector-icons/ionicons/glyphmaps/Ionicons.json'),
    ],
  };
} catch {
  ionicons = null;
}

let lucide: IconPack | null = null;
try {
  lucide = {
    Family: require('@react-native-vector-icons/lucide').default,
    glyphs: [
      require('@react-native-vector-icons/lucide/glyphmaps/Lucide.json'),
    ],
  };
} catch {
  lucide = null;
}

let materialDesignIcons: IconPack | null = null;
try {
  materialDesignIcons = {
    Family: require('@react-native-vector-icons/material-design-icons').default,
    glyphs: [
      require('@react-native-vector-icons/material-design-icons/glyphmaps/MaterialDesignIcons.json'),
    ],
  };
} catch {
  materialDesignIcons = null;
}

let materialIcons: IconPack | null = null;
try {
  materialIcons = {
    Family: require('@react-native-vector-icons/material-icons').default,
    glyphs: [
      require('@react-native-vector-icons/material-icons/glyphmaps/MaterialIcons.json'),
    ],
  };
} catch {
  materialIcons = null;
}

let octicons: IconPack | null = null;
try {
  octicons = {
    Family: require('@react-native-vector-icons/octicons').default,
    glyphs: [
      require('@react-native-vector-icons/octicons/glyphmaps/Octicons.json'),
    ],
  };
} catch {
  octicons = null;
}

let simpleLineIcons: IconPack | null = null;
try {
  simpleLineIcons = {
    Family: require('@react-native-vector-icons/simple-line-icons').default,
    glyphs: [
      require('@react-native-vector-icons/simple-line-icons/glyphmaps/SimpleLineIcons.json'),
    ],
  };
} catch {
  simpleLineIcons = null;
}

let zocial: IconPack | null = null;
try {
  zocial = {
    Family: require('@react-native-vector-icons/zocial').default,
    glyphs: [
      require('@react-native-vector-icons/zocial/glyphmaps/Zocial.json'),
    ],
  };
} catch {
  zocial = null;
}

// Documents persist glyph names as plain strings, so the per-family literal
// name unions (~30k strings across all families) are erased here — this is the
// single place that cast lives.
const glyphComponent = (Family: ComponentType<never>) =>
  styled(Family as ComponentType<IconGlyphProps>);

type FontAwesomeVariant = 'solid' | 'regular' | 'brand';

/** FontAwesome 5/6 pick the variant via an `iconStyle` prop on one component. */
const fontAwesomeVariant = (
  Family: ComponentType<never>,
  iconStyle: FontAwesomeVariant,
  displayName: string,
) => {
  const FontAwesome = Family as ComponentType<
    IconGlyphProps & { iconStyle: FontAwesomeVariant }
  >;
  const Variant = (props: IconGlyphProps) => (
    <FontAwesome
      {...({ ...props, iconStyle } as ComponentProps<typeof FontAwesome>)}
    />
  );
  Variant.displayName = `${displayName}.${iconStyle}`;
  return styled(Variant);
};

/**
 * The glyph component of a family whose package is not installed. Rendering
 * it is a project-configuration error, so it throws with the fix instead of
 * drawing a placeholder.
 */
const missingFamily = (key: IconFamilyKey, npm: string) => {
  const Missing = (_props: IconGlyphProps) => {
    throw new Error(
      `Icon family "${key}" needs ${npm} to render its glyphs. ` +
        'Creator-first app: enable its icon pack in Project settings → ' +
        'Packages. Code-first app: run `mapples sync` (it adds the pack to ' +
        'package.json), then the install command the sync names.',
    );
  };
  Missing.displayName = `MissingIconFamily.${key}`;
  return styled(Missing);
};

const defineFamily = (
  key: IconFamilyKey,
  label: string,
  pack: IconPack | null,
  glyphIndex = 0,
  wrap: (
    Family: ComponentType<never>,
  ) => ComponentType<WithStyledProps<IconGlyphProps>> = glyphComponent,
): IconFamily => {
  const npm = ICON_FAMILY_NPM[key];
  if (!pack) {
    return {
      key,
      label,
      npm,
      installed: false,
      Component: missingFamily(key, npm),
      glyphMap: {},
    };
  }
  return {
    key,
    label,
    npm,
    installed: true,
    Component: wrap(pack.Family),
    glyphMap: pack.glyphs[glyphIndex],
  };
};

/**
 * Registry of every known icon family, keyed by the persisted
 * {@link IconFamilyKey}. Every key is always present; check
 * {@link IconFamily.installed} before relying on a family's glyphs.
 *
 * @public
 */
export const IconFamilies: Record<IconFamilyKey, IconFamily> = {
  'ant-design': defineFamily('ant-design', 'AntDesign', antDesign),
  entypo: defineFamily('entypo', 'Entypo', entypo),
  'evil-icons': defineFamily('evil-icons', 'EvilIcons', evilIcons),
  feather: defineFamily('feather', 'Feather', feather),
  fontawesome: defineFamily('fontawesome', 'FontAwesome', fontAwesome),
  'fontawesome5-solid': defineFamily(
    'fontawesome5-solid',
    'FontAwesome 5 Solid',
    fontAwesome5,
    FA_SOLID,
    (Family) => fontAwesomeVariant(Family, 'solid', 'FontAwesome5'),
  ),
  'fontawesome5-regular': defineFamily(
    'fontawesome5-regular',
    'FontAwesome 5 Regular',
    fontAwesome5,
    FA_REGULAR,
    (Family) => fontAwesomeVariant(Family, 'regular', 'FontAwesome5'),
  ),
  'fontawesome5-brands': defineFamily(
    'fontawesome5-brands',
    'FontAwesome 5 Brands',
    fontAwesome5,
    FA_BRANDS,
    (Family) => fontAwesomeVariant(Family, 'brand', 'FontAwesome5'),
  ),
  'fontawesome6-solid': defineFamily(
    'fontawesome6-solid',
    'FontAwesome 6 Solid',
    fontAwesome6,
    FA_SOLID,
    (Family) => fontAwesomeVariant(Family, 'solid', 'FontAwesome6'),
  ),
  'fontawesome6-regular': defineFamily(
    'fontawesome6-regular',
    'FontAwesome 6 Regular',
    fontAwesome6,
    FA_REGULAR,
    (Family) => fontAwesomeVariant(Family, 'regular', 'FontAwesome6'),
  ),
  'fontawesome6-brands': defineFamily(
    'fontawesome6-brands',
    'FontAwesome 6 Brands',
    fontAwesome6,
    FA_BRANDS,
    (Family) => fontAwesomeVariant(Family, 'brand', 'FontAwesome6'),
  ),
  fontisto: defineFamily('fontisto', 'Fontisto', fontisto),
  foundation: defineFamily('foundation', 'Foundation', foundation),
  ionicons: defineFamily('ionicons', 'Ionicons', ionicons),
  lucide: defineFamily('lucide', 'Lucide', lucide),
  'material-design-icons': defineFamily(
    'material-design-icons',
    'Material Design Icons',
    materialDesignIcons,
  ),
  'material-icons': defineFamily(
    'material-icons',
    'Material Icons',
    materialIcons,
  ),
  octicons: defineFamily('octicons', 'Octicons', octicons),
  'simple-line-icons': defineFamily(
    'simple-line-icons',
    'Simple Line Icons',
    simpleLineIcons,
  ),
  zocial: defineFamily('zocial', 'Zocial', zocial),
};
