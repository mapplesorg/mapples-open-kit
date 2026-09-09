import { forwardRef, PropsWithChildren, useCallback, useState } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledProps,
  StyledView,
  Styler,
  SvgStyle,
  Typography,
} from '@mapples/style';
import {
  ActivityIndicator,
  GestureResponderEvent,
  MouseEvent,
  PressableProps,
  TextStyle,
  View,
} from 'react-native';

import useTones, { TonePalette, Tones } from '../../../hooks/useTones';
import {
  ButtonVariant,
  CONTROL_SIZES,
  ControlSize,
  DISABLED_OPACITY,
  ELEVATION,
  Tokens,
  Tone,
} from '../../../tokens';
import Icon from '../../media/Icon';

/**
 * Props for the Button component.
 *
 * @public
 */
export interface ButtonProps extends PressableProps {
  /** The text label to display on the button */
  label?: string;
  /** Styling configuration for the button and its typography */
  styled?: StyledProps<PressableProps> & {
    /** Typography-specific styling for the button label */
    styleTypography?: StyledProp<TextStyle>;
    /** Glyph styling for the leading/trailing icons (themed variants) */
    styleIcon?: StyledProp<SvgStyle>;
  };
  /** Typography variant to apply to the button label */
  typographyVariant?: string;
  /**
   * Themed appearance. Unset renders the bare pressable exactly as before —
   * the label takes the typography document's colour and every colour comes
   * from `styled`. Set, the button paints itself from the project theme:
   * `filled` (tone fill), `tonal` (tinted container), `outlined`, `text` and
   * `elevated` (surface + shadow).
   */
  variant?: ButtonVariant;
  /** Control size (themed variants): `sm` 36, `md` 44, `lg` 52 points tall. */
  size?: ControlSize;
  /** Colour role of the themed variants. Defaults to `primary`. */
  tone?: Tone;
  /** Glyph shown before the label (project icon family). */
  leadingIconName?: string;
  /** Glyph shown after the label (project icon family). */
  trailingIconName?: string;
  /** Shows an activity indicator in place of the leading glyph and ignores presses. */
  loading?: boolean;
  /** Stretches the button across its parent (themed variants). */
  fullWidth?: boolean;
}

interface VariantColors {
  background: string;
  label: string;
  border?: string;
  elevated?: boolean;
}

const variantColors = (
  variant: ButtonVariant,
  palette: TonePalette,
  tones: Tones,
): VariantColors => {
  switch (variant) {
    case 'filled':
      return { background: palette.main, label: palette.contrast };
    case 'tonal':
      return { background: palette.container, label: palette.onContainer };
    case 'outlined':
      return {
        background: 'transparent',
        label: palette.main,
        border: tones.outlineStrong,
      };
    case 'text':
      return { background: 'transparent', label: palette.main };
    case 'elevated':
      return {
        background: tones.resolve(Tokens.color.surface),
        label: palette.main,
        // Shadows vanish on dark surfaces — a hairline keeps the edge.
        border: tones.isDark ? tones.outline : undefined,
        elevated: true,
      };
  }
};

/**
 * A customizable button component with built-in styling support.
 *
 * Without `variant` the Button is React Native's Pressable plus a label —
 * every colour comes from `styled`. With `variant` it is a themed control:
 * the fill, label colour, outline and elevation follow the project theme and
 * the chosen `tone`, `size` sets the height and label scale, and glyphs,
 * loading and disabled states are built in. Author styles in `styled` still
 * override every part.
 *
 * @example
 * ```tsx
 * <Button
 *   label="Continue"
 *   variant="filled"
 *   size="lg"
 *   trailingIconName="arrow-forward"
 *   onPress={() => console.log('Button pressed')}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Bare pressable — the legacy render
 * <Button
 *   label="Click me"
 *   styled={{
 *     style: { backgroundColor: 'blue', padding: 16 },
 *     styleTypography: { color: 'white', fontSize: 16 }
 *   }}
 * />
 * ```
 *
 * @public
 */
const Button = forwardRef<View, PropsWithChildren<ButtonProps>>(
  (
    {
      label,
      styled = {},
      typographyVariant,
      variant,
      size = 'md',
      tone = 'primary',
      leadingIconName,
      trailingIconName,
      loading = false,
      disabled = false,
      fullWidth = false,
      onPressIn,
      onPressOut,
      onHoverIn,
      onHoverOut,
      children,
      ...props
    },
    ref,
  ) => {
    const { styleTypography, styleIcon, ...styledPressableProps } = styled;
    const tones = useTones();
    const [pressed, setPressed] = useState(false);
    const [hovered, setHovered] = useState(false);

    const handlePressIn = useCallback(
      (event: GestureResponderEvent) => {
        setPressed(true);
        onPressIn?.(event);
      },
      [onPressIn],
    );
    const handlePressOut = useCallback(
      (event: GestureResponderEvent) => {
        setPressed(false);
        onPressOut?.(event);
      },
      [onPressOut],
    );
    const handleHoverIn = useCallback(
      (event: MouseEvent) => {
        setHovered(true);
        onHoverIn?.(event);
      },
      [onHoverIn],
    );
    const handleHoverOut = useCallback(
      (event: MouseEvent) => {
        setHovered(false);
        onHoverOut?.(event);
      },
      [onHoverOut],
    );

    if (variant === undefined) {
      return (
        <StyledPressable
          ref={ref}
          styled={styledPressableProps}
          disabled={disabled}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onHoverIn={onHoverIn}
          onHoverOut={onHoverOut}
          {...props}
        >
          {label && (
            <Typography style={styleTypography} variant={typographyVariant}>
              {label}
            </Typography>
          )}
          {children}
        </StyledPressable>
      );
    }

    const spec = CONTROL_SIZES[size];
    const colors = variantColors(variant, tones.tone(tone), tones);
    const isDisabled = !!disabled;
    const inactive = isDisabled || loading;
    const iconOnly =
      !label && (!!leadingIconName || !!trailingIconName || loading);
    // An author colour on the label slot also tints the glyphs and the state layer.
    const authoredLabelColor = Styler.flatten(styleTypography)?.color;
    const labelColor =
      typeof authoredLabelColor === 'string'
        ? tones.resolve(authoredLabelColor)
        : colors.label;
    const showLayer = !inactive && (pressed || hovered);

    const renderGlyph = (iconName?: string) =>
      iconName ? (
        <Icon
          iconName={iconName}
          size={spec.iconSize}
          color={labelColor}
          styled={{ styleSvg: styleIcon }}
        />
      ) : null;

    return (
      <StyledPressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: inactive, busy: loading }}
        disabled={inactive}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        styled={{
          ...styledPressableProps,
          style: [
            styler.root,
            {
              height: spec.height,
              minWidth: iconOnly ? spec.height : undefined,
              paddingHorizontal: iconOnly
                ? 0
                : variant === 'text'
                  ? spec.paddingX - 4
                  : spec.paddingX,
              borderRadius: spec.radius,
              backgroundColor: colors.background,
              borderWidth: colors.border ? 1 : 0,
              borderColor: colors.border ?? 'transparent',
            },
            colors.elevated && styler.elevated,
            fullWidth && styler.fullWidth,
            styledPressableProps.style,
            isDisabled && styler.disabled,
          ],
        }}
        {...props}
      >
        {showLayer && (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                styler.stateLayer,
                {
                  backgroundColor: tones.stateLayer(
                    labelColor,
                    pressed ? 'pressed' : 'hover',
                  ),
                  borderRadius: spec.radius,
                },
              ],
            }}
          />
        )}
        {loading ? (
          <ActivityIndicator size="small" color={labelColor} />
        ) : (
          renderGlyph(leadingIconName)
        )}
        {!!label && (
          <Typography
            variant={typographyVariant ?? spec.labelVariant}
            numberOfLines={1}
            style={[{ color: colors.label }, styleTypography]}
          >
            {label}
          </Typography>
        )}
        {renderGlyph(trailingIconName)}
        {children}
      </StyledPressable>
    );
  },
);
Button.displayName = 'Button';

const styler = Styler.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    overflow: 'hidden',
  },
  elevated: {
    boxShadow: ELEVATION,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  stateLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default Button;
