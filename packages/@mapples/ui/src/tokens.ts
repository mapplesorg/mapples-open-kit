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

export type RadiusKey = keyof typeof RADII;

/** The corner radii and control geometry of a project. */
export interface Shape {
  radius: Record<RadiusKey, number>;
  control: Record<ControlSize, ControlSizeSpec>;
}

/** The shape when a project's sizing names no `radius`, `radiusLarge` or `control`. */
export const DEFAULT_SHAPE: Shape = { radius: RADII, control: CONTROL_SIZES };

/**
 * The project sizing keys the shape reads — what the design setup writes:
 * `radius` (controls, chips, small surfaces), `radiusLarge` (cards, sheets,
 * dialogs) and `control` (the height of an `md` control).
 */
export const SHAPE_SIZING_KEYS = {
  radius: 'sizing.radius',
  radiusLarge: 'sizing.radiusLarge',
  control: 'sizing.control',
} as const;

/**
 * Derives the shape from a project's sizing. Each value left undefined keeps
 * the default, so the defaults reproduce {@link RADII} and
 * {@link CONTROL_SIZES} exactly.
 *
 * - `radius` sets `md` and scales `xs`/`sm` with it; `radiusLarge` sets `lg`
 *   and scales `xl`. A `radius` of 0 is a sharp direction: pills square off.
 * - `control` sets the `md` height; `sm`/`lg` keep their 8 pt steps. Control
 *   corners follow `radius` and never exceed half the height (a pill).
 */
export const resolveShape = (
  radius: number | undefined,
  radiusLarge: number | undefined,
  control: number | undefined,
): Shape => {
  const small = radius ?? RADII.md;
  const large = radiusLarge ?? RADII.lg;
  const height = control ?? CONTROL_SIZES.md.height;
  const sharp = small === 0;
  const scaleSmall = small / RADII.md;

  const controlSpec = (size: ControlSize): ControlSizeSpec => {
    const base = CONTROL_SIZES[size];
    const sized = base.height + (height - CONTROL_SIZES.md.height);
    const corner = sharp
      ? 0
      : Math.min(sized / 2, Math.max(0, base.radius + small - RADII.md));
    return { ...base, height: sized, radius: corner };
  };

  return {
    radius: {
      xs: Math.round(RADII.xs * scaleSmall),
      sm: Math.round(RADII.sm * scaleSmall),
      md: small,
      lg: large,
      xl: Math.round((large * RADII.xl) / RADII.lg),
      pill: sharp ? 0 : RADII.pill,
    },
    control: {
      sm: controlSpec('sm'),
      md: controlSpec('md'),
      lg: controlSpec('lg'),
    },
  };
};

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
