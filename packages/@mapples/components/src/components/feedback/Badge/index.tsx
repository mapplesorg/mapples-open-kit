import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { RADII, Tone, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { defaults } from './defaults';
import {
  BADGE_GEOMETRY,
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
  /** Presentation. Defaults to `text` with a label, `number` with a count, else `dot`. */
  variant?: BadgeVariant;
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
  };
}

/**
 * A standalone count, dot or short label in a tone-coloured pill — unread
 * counts, "New" tags, status dots. A count badge hides itself at 0 so an
 * empty inbox shows nothing; `max` caps large counts as `99+`.
 *
 * @example
 * ```tsx
 * <Badge count={unread} />
 * <Badge label="New" tone="success" />
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
      (label ? 'text' : typeof count === 'number' ? 'number' : 'dot');
    const text =
      resolvedVariant === 'text'
        ? label
        : resolvedVariant === 'number' && typeof count === 'number' && count > 0
          ? badgeCountText(count, max)
          : undefined;
    const isDot = resolvedVariant === 'dot';

    // Nothing to show: no count (or 0) and no label.
    if (!isDot && !text) return null;

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
                  borderRadius: RADII.pill,
                  paddingHorizontal: geometry.paddingX,
                },
            { backgroundColor: palette.main },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {text ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            numberOfLines={1}
            style={[
              defaults.label,
              {
                color: palette.contrast,
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
