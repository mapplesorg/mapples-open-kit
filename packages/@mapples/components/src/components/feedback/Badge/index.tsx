import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { Icon, TYPOGRAPHY_PARTS, Tone, useShape, useTones } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  BADGE_GEOMETRY,
  BadgeAppearance,
  badgeCountText,
  BadgeSize,
  BadgeVariant,
} from './types';

/** Props for {@link Badge}. */
export interface BadgeProps extends Omit<ViewProps, 'children'> {
  /** Short text ('New'); makes the badge a text pill. */
  label?: string;
  /** Count to show; the badge hides at 0 or when unset unless a label or dot is asked for. */
  count?: number;
  /** Cap of the count — larger counts render as `${max}+`. Defaults to `99`. */
  max?: number;
  /** Presentation. Defaults to `text` with a label, `number` with a count, `text` (icon only) with just an `iconName`, else `dot`. */
  variant?: BadgeVariant;
  /** Glyph before the text (project icon family) — a check in "Completed", an arrow on a price drop. A `dot` draws none. */
  iconName?: string;
  /**
   * Colour treatment: `solid` the tone's main fill with contrast text, `soft`
   * the tone's tinted container with tone ink text, `outline` transparent
   * with a tone border and ink text. Defaults to `solid`.
   */
  appearance?: BadgeAppearance;
  /** Colour role. Defaults to `error`. */
  tone?: Tone;
  /** Height: `sm` 16, `md` 20. Defaults to `md`. */
  size?: BadgeSize;
  /** Styled slots for every visual part. */
  styled?: {
    /** The pill (or dot). */
    style?: StyledProp<ViewStyle>;
    /** The label text. */
    styleLabel?: StyledProp<TextStyle>;
    /** The leading glyph (`color`; follows the label colour by default). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
  };
}

/**
 * A standalone count, dot or short label in a tone-coloured pill — unread
 * counts, "New" tags, status dots. A count badge hides itself at 0 so an
 * empty inbox shows nothing; `max` caps large counts as `99+`. `iconName`
 * leads the text with a glyph; `appearance` picks a solid, soft or outline
 * treatment of the tone.
 *
 * @example
 * ```tsx
 * <Badge count={unread} />
 * <Badge label="New" tone="success" />
 * <Badge label="Completed" iconName="check" appearance="soft" tone="success" />
 * <Badge variant="dot" />
 * ```
 *
 * @public
 */
const Badge: ForwardRefExoticComponent<
  PropsWithChildren<BadgeProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<BadgeProps>>(
  (
    {
      label,
      count,
      max = 99,
      variant,
      iconName,
      appearance = 'solid',
      tone = 'error',
      size = 'md',
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    const palette = tones.tone(tone);
    const geometry = BADGE_GEOMETRY[size];
    if (
      count !== undefined &&
      (typeof count !== 'number' || !Number.isFinite(count))
    ) {
      throw new Error(
        `Badge: count (${String(count)}) must be a finite number`,
      );
    }
    if (typeof max !== 'number' || !Number.isFinite(max)) {
      throw new Error(`Badge: max (${String(max)}) must be a finite number`);
    }

    const resolvedVariant: BadgeVariant =
      variant ??
      (label
        ? 'text'
        : typeof count === 'number'
          ? 'number'
          : iconName
            ? 'text'
            : 'dot');
    const text =
      resolvedVariant === 'text'
        ? label
        : resolvedVariant === 'number' && typeof count === 'number' && count > 0
          ? badgeCountText(count, max)
          : undefined;
    const isDot = resolvedVariant === 'dot';
    const hasIcon = !isDot && !!iconName;

    const fill =
      appearance === 'solid'
        ? palette.main
        : appearance === 'soft'
          ? palette.container
          : 'transparent';
    const labelColor = useSlotColor(
      styled?.styleLabel,
      'color',
      appearance === 'solid' ? palette.contrast : palette.ink,
    );
    const glyphColor = useSlotColor(styled?.styleIcon, 'color', labelColor);

    // Nothing to show: a count of 0 (or none), or neither label nor icon.
    if (resolvedVariant === 'number' && !text) return null;
    if (resolvedVariant === 'text' && !text && !hasIcon) return null;

    return (
      <StyledView
        ref={ref}
        accessibilityRole={isDot ? undefined : 'text'}
        accessibilityLabel={text}
        styled={{
          style: [
            defaults.root,
            isDot
              ? {
                  width: geometry.dot,
                  height: geometry.dot,
                  borderRadius: geometry.dot / 2,
                }
              : {
                  minWidth: geometry.height,
                  height: geometry.height,
                  borderRadius: shape.radius.pill,
                  paddingHorizontal: geometry.paddingX,
                },
            hasIcon && [defaults.withIcon, { gap: geometry.gap }],
            { backgroundColor: fill },
            appearance === 'outline' && {
              borderWidth: shape.borderWidth(1),
              borderColor: palette.ink,
            },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {hasIcon ? (
          <Icon iconName={iconName} size={geometry.icon} color={glyphColor} />
        ) : null}
        {text ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            numberOfLines={1}
            style={[
              defaults.label,
              {
                color: labelColor,
                fontSize: geometry.fontSize,
                lineHeight: geometry.lineHeight,
              },
              styled?.styleLabel,
            ]}
          >
            {text}
          </Typography>
        ) : null}
      </StyledView>
    );
  },
);
Badge.displayName = 'Badge';

export default Badge;
