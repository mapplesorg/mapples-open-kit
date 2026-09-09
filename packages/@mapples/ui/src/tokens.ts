/**
 * @fileoverview The shared design vocabulary of the themed components —
 * the `@mapples/ui` `Button`/`IconButton` variants and every
 * `@mapples/components` widget draw their colours, sizes and radii from
 * here, so one source of truth feeds the runtime, the editor schematics (the
 * inspector `Select` options) and the AI digest.
 *
 * Colours are theme-token strings resolved by `@mapples/style`. The key
 * structure is the Mapples palette contract every project theme satisfies
 * (the default palette and the AI design schema enforce it): `background`,
 * `primary`, `accent`, `text`, `neutral`, `system`.
 *
 * @public
 */

/** Control sizes shared by buttons, fields and selection controls. */
export const CONTROL_SIZE_KEYS = ['sm', 'md', 'lg'] as const;
export type ControlSize = (typeof CONTROL_SIZE_KEYS)[number];

export interface ControlSizeSpec {
  /** Control height in points — `md` satisfies the 44 pt touch target. */
  height: number;
  /** Glyph size for leading/trailing icons. */
  iconSize: number;
  /** Horizontal padding of a control with a label. */
  paddingX: number;
  /** Typography variant of the control label. */
  labelVariant: string;
  /** Corner radius of the control. */
  radius: number;
}

/**
 * Geometry per control size. Points, not sizing tokens, so a control keeps
 * its proportions whatever base a project's sizing scale uses.
 */
export const CONTROL_SIZES: Record<ControlSize, ControlSizeSpec> = {
  sm: {
    height: 36,
    iconSize: 16,
    paddingX: 12,
    labelVariant: 'Label',
    radius: 10,
  },
  md: {
    height: 44,
    iconSize: 20,
    paddingX: 16,
    labelVariant: 'Button',
    radius: 12,
  },
  lg: {
    height: 52,
    iconSize: 24,
    paddingX: 20,
    labelVariant: 'Button',
    radius: 14,
  },
};

/** Corner radius scale. */
export const RADII = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Opacity of a disabled control. */
export const DISABLED_OPACITY = 0.38;

/** Alpha of the state layer painted over a control in the label colour. */
export const STATE_LAYER_OPACITY = { hover: 0.08, pressed: 0.12 } as const;

/**
 * The one elevation level, as the CSS `boxShadow` string React Native and
 * the web accept; on dark themes surfaces add a 1 px outline as well because
 * shadows vanish. The object form (`ELEVATION_SHADOW`) is what schematics and
 * the AI write into style slots — the styled pipeline converts it.
 */
export const ELEVATION = '0px 2px 8px rgba(0, 0, 0, 0.12)';
export const ELEVATION_SHADOW = {
  x: 0,
  y: 2,
  radius: 8,
  color: 'rgba(0, 0, 0, 0.12)',
} as const;

/** Typography variants by the part of a component they set. */
export const TYPOGRAPHY_PARTS = {
  label: 'Label',
  button: 'Button',
  body: 'Body',
  title: 'Subtitle',
  headline: 'Headline',
  helper: 'Caption',
  overline: 'Overline',
  link: 'Link',
} as const;

/** Theme-token strings for the palette contract. */
export const Tokens = {
  color: {
    primary: 'theme.primary.main',
    primaryLight: 'theme.primary.light',
    primaryDark: 'theme.primary.dark',
    onPrimary: 'theme.primary.contrast',
    primaryContainer: 'theme.primary.background',
    accent: 'theme.accent.main',
    accentLight: 'theme.accent.light',
    accentDark: 'theme.accent.dark',
    onAccent: 'theme.accent.contrast',
    accentContainer: 'theme.accent.background',
    surface: 'theme.background.card',
    background: 'theme.background.primary',
    inverse: 'theme.background.contrast',
    text: 'theme.text.primary',
    textSecondary: 'theme.text.secondary',
    textTertiary: 'theme.text.tertiary',
    white: 'theme.neutral.white',
    black: 'theme.neutral.black',
    error: 'theme.system.error',
    success: 'theme.system.success',
    warning: 'theme.system.warning',
    info: 'theme.system.info',
  },
} as const;

/** Visual variants of `Button`. */
export const BUTTON_VARIANTS = [
  'filled',
  'tonal',
  'outlined',
  'text',
  'elevated',
] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

/** Visual variants of `IconButton` when it renders a glyph by name. */
export const ICON_BUTTON_VARIANTS = [
  'standard',
  'filled',
  'tonal',
  'outlined',
] as const;
export type IconButtonVariant = (typeof ICON_BUTTON_VARIANTS)[number];

/** Colour roles a control can take. */
export const TONES = [
  'primary',
  'accent',
  'neutral',
  'error',
  'success',
  'warning',
  'info',
] as const;
export type Tone = (typeof TONES)[number];
