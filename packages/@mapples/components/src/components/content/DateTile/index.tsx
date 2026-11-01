import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useShape,
  useTones,
} from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import {
  datePartsOf,
  MONTH_SHORT_NAMES,
  parseDate,
  readMonthLabels,
  spokenDate,
} from '../../../internal';

import { defaults } from './defaults';
import {
  DATE_TILE_GEOMETRY,
  DATE_TILE_MONTH_POSITIONS,
  DATE_TILE_SIZES,
  DATE_TILE_VARIANTS,
  DateTileMonthPosition,
  DateTileSize,
  DateTileVariant,
} from './types';

/** Props for {@link DateTile}. */
export interface DateTileProps extends Omit<ViewProps, 'children'> {
  /** The date as `'YYYY-MM-DD'`. Required — a missing or malformed date throws. */
  date?: string;
  /** An optional time line under the day, shown as written (`'19:00'`, `'7 PM'`). */
  time?: string;
  /** `sm` ≈56×56, `md` 56×64, `lg` 64×84 points. Defaults to `md`. */
  size?: DateTileSize;
  /** `filled` solid tone, `tonal` soft tone container, `outlined` tone border. Defaults to `tonal`. */
  variant?: DateTileVariant;
  /** Colour role of the tile. Defaults to `primary`. */
  tone?: Tone;
  /** Month label above (`top`) or below (`bottom`) the day number. Defaults to `top`. */
  monthPosition?: DateTileMonthPosition;
  /** Twelve short month names from January. Defaults to `Jan`…`Dec` (shown uppercase). */
  monthLabels?: string[];
  /** Styled slots for every visual part. */
  styled?: {
    /** The tile. */
    style?: StyledProp<ViewStyle>;
    /** The day number. */
    styleDay?: StyledProp<TextStyle>;
    /** The month label. */
    styleMonth?: StyledProp<TextStyle>;
    /** The time line. */
    styleTime?: StyledProp<TextStyle>;
  };
}

/**
 * A calendar date block — the big day number with the short month above or
 * below it and an optional time line, for event cards, agenda rows and
 * booking summaries. The tile reads as one element to screen readers
 * ("Saturday, October 24, 2026, 19:00").
 *
 * @example
 * ```tsx
 * <DateTile date="2026-10-24" time="19:00" />
 * <DateTile date="2026-10-24" size="lg" variant="filled" tone="accent" />
 * ```
 *
 * @public
 */
const DateTile: ForwardRefExoticComponent<
  PropsWithChildren<DateTileProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<DateTileProps>>(
  (
    {
      date,
      time,
      size = 'md',
      variant = 'tonal',
      tone = 'primary',
      monthPosition = 'top',
      monthLabels,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const component = 'DateTile';
    if (!DATE_TILE_SIZES.includes(size)) {
      throw new Error(
        `${component}: size (${String(size)}) must be one of ${DATE_TILE_SIZES.join(', ')}`,
      );
    }
    if (!DATE_TILE_VARIANTS.includes(variant)) {
      throw new Error(
        `${component}: variant (${String(variant)}) must be one of ${DATE_TILE_VARIANTS.join(', ')}`,
      );
    }
    if (!DATE_TILE_MONTH_POSITIONS.includes(monthPosition)) {
      throw new Error(
        `${component}: monthPosition (${String(monthPosition)}) must be one of ${DATE_TILE_MONTH_POSITIONS.join(', ')}`,
      );
    }
    if (time !== undefined && typeof time !== 'string') {
      throw new Error(`${component}: time must be a string`);
    }
    const dayNumber = parseDate(date, component, 'date');
    const parts = datePartsOf(dayNumber);
    const months = readMonthLabels(monthLabels, MONTH_SHORT_NAMES, component);
    const geometry = DATE_TILE_GEOMETRY[size];

    const tones = useTones();
    const shape = useShape();
    const palette = tones.tone(tone);
    const filled = variant === 'filled';
    const outlined = variant === 'outlined';
    const text = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const monthColor = filled ? palette.contrast : palette.ink;
    const dayColor = filled ? palette.contrast : text;
    const timeColor = filled ? palette.contrast : secondary;
    const showTime = time !== undefined && time !== '';

    const month = (
      <Typography
        key="month"
        variant={TYPOGRAPHY_PARTS.overline}
        numberOfLines={1}
        style={[
          defaults.month,
          {
            color: monthColor,
            fontSize: geometry.month,
            lineHeight: Math.round(geometry.month * 1.3),
          },
          styled?.styleMonth,
        ]}
      >
        {months[parts.month - 1]}
      </Typography>
    );
    const day = (
      <Typography
        key="day"
        variant={TYPOGRAPHY_PARTS.headline}
        numberOfLines={1}
        style={[
          defaults.day,
          {
            color: dayColor,
            fontSize: geometry.day,
            lineHeight: Math.round(geometry.day * 1.15),
          },
          styled?.styleDay,
        ]}
      >
        {String(parts.day)}
      </Typography>
    );

    return (
      <StyledView
        ref={ref}
        accessible
        accessibilityRole="text"
        accessibilityLabel={
          spokenDate(dayNumber) + (showTime ? `, ${time}` : '')
        }
        styled={{
          style: [
            defaults.root,
            {
              minWidth: geometry.width,
              minHeight: geometry.height,
              borderRadius: shape.radius.md,
              backgroundColor: filled
                ? palette.main
                : outlined
                  ? 'transparent'
                  : palette.container,
              borderWidth: outlined ? shape.borderWidth(1.5) : 0,
              borderColor: outlined ? palette.ink : 'transparent',
            },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {monthPosition === 'top' ? [month, day] : [day, month]}
        {showTime ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            numberOfLines={1}
            style={[
              defaults.time,
              {
                color: timeColor,
                fontSize: geometry.time,
                lineHeight: Math.round(geometry.time * 1.3),
              },
              styled?.styleTime,
            ]}
          >
            {time}
          </Typography>
        ) : null}
      </StyledView>
    );
  },
);
DateTile.displayName = 'DateTile';

export default DateTile;
