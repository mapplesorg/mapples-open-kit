import {
  forwardRef,
  PropsWithChildren,
  ReactNode,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  DISABLED_OPACITY,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useShape,
  useTones,
} from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import {
  addMonths,
  datePartsOf,
  dayNumberOf,
  daysInMonth,
  formatDate,
  formatMonth,
  Glyph,
  localToday,
  MONTH_NAMES,
  parseDate,
  parseMonth,
  readMonthLabels,
  readWeekdayLabels,
  readWeekStart,
  spokenDate,
  startOfWeek,
  useControllableState,
} from '../../../internal';

import { defaults } from './defaults';
import {
  CALENDAR_GEOMETRY,
  CALENDAR_MODES,
  CALENDAR_WEEKDAY_LABELS,
  CalendarMode,
  CalendarValue,
  CalendarWeekStart,
  emptyCalendarValue,
  readCalendarValue,
  readCalendarDisabledDates,
} from './types';

/** Props for {@link Calendar}. */
export interface CalendarProps extends Omit<ViewProps, 'children'> {
  /** `single` picks one date; `range` picks a start and an end (check-in / check-out). Defaults to `single`. */
  mode?: CalendarMode;
  /** Selection (controlled): a `'YYYY-MM-DD'` date (`''` for none), or `{start, end}` in `range` mode (`''` where unset). Omit to let the calendar keep its own state. */
  value?: CalendarValue;
  /** Initial selection while uncontrolled. Defaults to none. */
  defaultValue?: CalendarValue;
  /** Fires with the next selection — the new value is the first argument. */
  onValueChange?: (value: CalendarValue) => void;
  /** Lets a range start and end on the same day (`range` mode). Defaults to `false`. */
  allowSameDay?: boolean;
  /** The shown month as `'YYYY-MM'`; the arrows move away from it and a new value jumps back. Defaults to the month of the value, else of `today`. */
  month?: string;
  /** Fires with the `'YYYY-MM'` month the arrows move to. */
  onMonthChange?: (month: string) => void;
  /** Earliest pressable date as `'YYYY-MM-DD'`. */
  minDate?: string;
  /** Latest pressable date as `'YYYY-MM-DD'`. */
  maxDate?: string;
  /** Dates that are dimmed, struck through and not pressable; a range never spans one. */
  disabledDates?: string[];
  /** The outlined current day as `'YYYY-MM-DD'`. Defaults to the device's date. */
  today?: string;
  /** First day of the week: `0` Sunday, `1` Monday. Defaults to `1`. */
  weekStart?: CalendarWeekStart;
  /** Seven weekday labels starting from Sunday (reordered by `weekStart`). Defaults to `Su`…`Sa`. */
  weekdayLabels?: string[];
  /** Twelve month names from January for the title. Defaults to `January`…`December`. */
  monthLabels?: string[];
  /** Colour role of the selection and the range band. Defaults to `primary`. */
  tone?: Tone;
  /** Disables every day and the month arrows. */
  disabled?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The whole calendar. */
    style?: StyledProp<ViewStyle>;
    /** The month title. */
    styleTitle?: StyledProp<TextStyle>;
    /** The previous/next month buttons. */
    styleNav?: StyledProp<ViewStyle>;
    /** The weekday header labels. */
    styleWeekday?: StyledProp<TextStyle>;
    /** Every day circle. */
    styleDay?: StyledProp<ViewStyle>;
    /** The day numbers. */
    styleDayText?: StyledProp<TextStyle>;
    /** A selected day (or a range start/end). */
    styleDaySelected?: StyledProp<ViewStyle>;
    /** The `today` day. */
    styleDayToday?: StyledProp<ViewStyle>;
    /** A disabled day. */
    styleDayDisabled?: StyledProp<ViewStyle>;
    /** The tinted band behind a range. */
    styleRange?: StyledProp<ViewStyle>;
  };
}

/**
 * A month calendar for picking a date or a date range — a booking date, or a
 * travel stay's check-in and check-out. In `range` mode the first tap sets
 * the start, the second the end (a tap before the start, or past a disabled
 * date, starts over), and the days between are drawn as one tinted band
 * between filled start and end circles. Arrows page through the months;
 * `minDate`, `maxDate` and `disabledDates` mute days. Dates are plain
 * `'YYYY-MM-DD'` strings.
 *
 * @example
 * ```tsx
 * <Calendar value={day} onValueChange={setDay} minDate="2026-10-22" />
 * <Calendar mode="range" defaultValue={{ start: '2026-11-07', end: '2026-11-10' }} />
 * ```
 *
 * @public
 */
const Calendar: ForwardRefExoticComponent<
  PropsWithChildren<CalendarProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<CalendarProps>>(
  (
    {
      mode = 'single',
      value,
      defaultValue,
      onValueChange,
      allowSameDay = false,
      month,
      onMonthChange,
      minDate,
      maxDate,
      disabledDates,
      today,
      weekStart = 1,
      weekdayLabels,
      monthLabels,
      tone = 'primary',
      disabled = false,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const component = 'Calendar';
    if (!CALENDAR_MODES.includes(mode)) {
      throw new Error(
        `${component}: mode (${String(mode)}) must be one of ${CALENDAR_MODES.join(', ')}`,
      );
    }
    const range = mode === 'range';
    const start = readWeekStart(weekStart, component);
    const labelsFromSunday = readWeekdayLabels(
      weekdayLabels,
      CALENDAR_WEEKDAY_LABELS,
      component,
    );
    const columnLabels = Array.from(
      { length: 7 },
      (_, index) => labelsFromSunday[(start + index) % 7],
    );
    const titles = readMonthLabels(monthLabels, MONTH_NAMES, component);
    const todayDay =
      today === undefined ? localToday() : parseDate(today, component, 'today');
    const minDay =
      minDate === undefined
        ? undefined
        : parseDate(minDate, component, 'minDate');
    const maxDay =
      maxDate === undefined
        ? undefined
        : parseDate(maxDate, component, 'maxDate');
    if (minDay !== undefined && maxDay !== undefined && minDay > maxDay) {
      throw new Error(
        `${component}: minDate (${minDate}) is after maxDate (${maxDate})`,
      );
    }
    const blocked = readCalendarDisabledDates(disabledDates, component);
    if (month !== undefined) parseMonth(month, component, 'month');

    const [current, setCurrent] = useControllableState<CalendarValue>({
      value,
      defaultValue: defaultValue ?? emptyCalendarValue(mode),
      onChange: onValueChange,
    });
    const selection = readCalendarValue(current, mode, component);

    // `month` sets the shown month; the arrows move away from it locally and
    // a new `month` value jumps back.
    const [shownMonth, setShownMonth] = useState<string>(() => {
      if (month !== undefined) return month;
      const parts = datePartsOf(selection.start ?? todayDay);
      return formatMonth(parts.year, parts.month);
    });
    const [monthProp, setMonthProp] = useState(month);
    if (month !== monthProp) {
      setMonthProp(month);
      if (month !== undefined) setShownMonth(month);
    }
    const shown = parseMonth(shownMonth, component, 'month');

    const tones = useTones();
    const shape = useShape();
    const palette = tones.tone(tone);
    const text = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const geometry = CALENDAR_GEOMETRY;
    const round = Math.min(shape.radius.pill, geometry.day / 2);
    const navRound = Math.min(shape.radius.pill, geometry.nav / 2);

    const firstDay = dayNumberOf(shown.year, shown.month, 1);
    const count = daysInMonth(shown.year, shown.month);
    const lastDay = firstDay + count - 1;
    const gridStart = startOfWeek(firstDay, start);
    const rows = Math.ceil((firstDay - gridStart + count) / 7);
    const prevDisabled =
      disabled || (minDay !== undefined && firstDay <= minDay);
    const nextDisabled =
      disabled || (maxDay !== undefined && lastDay >= maxDay);

    const isDayDisabled = (day: number) =>
      (minDay !== undefined && day < minDay) ||
      (maxDay !== undefined && day > maxDay) ||
      blocked.has(day);

    const goTo = (delta: number) => {
      const next = addMonths(shown.year, shown.month, delta);
      const key = formatMonth(next.year, next.month);
      setShownMonth(key);
      onMonthChange?.(key);
    };

    const press = (day: number) => {
      const date = formatDate(day);
      if (!range) {
        setCurrent(date);
        return;
      }
      const { start: from, end: to } = selection;
      if (from === undefined || to !== undefined || day < from) {
        setCurrent({ start: date, end: '' });
        return;
      }
      if (day === from) {
        setCurrent(
          allowSameDay ? { start: date, end: date } : emptyCalendarValue(mode),
        );
        return;
      }
      for (let between = from + 1; between < day; between += 1) {
        if (blocked.has(between)) {
          setCurrent({ start: date, end: '' });
          return;
        }
      }
      setCurrent({ start: formatDate(from), end: date });
    };

    const { start: from, end: to } = selection;
    const hasBand =
      range && from !== undefined && to !== undefined && to > from;

    const renderDay = (day: number, column: number): ReactNode => {
      const isStart = day === from;
      const isEnd = day === to;
      const isSelected = isStart || isEnd;
      const inBand = hasBand && day >= from && day <= to;
      const isToday = day === todayDay;
      const isOff = isDayDisabled(day);
      const bandOpensLeft = column === 0 || day === firstDay;
      const bandClosesRight = column === 6 || day === lastDay;
      const role = !range
        ? ''
        : isStart && isEnd
          ? ', range start and end'
          : isStart
            ? ', range start'
            : isEnd
              ? ', range end'
              : inBand
                ? ', in range'
                : '';
      const dayColor = isSelected
        ? palette.contrast
        : inBand
          ? palette.onContainer
          : isToday
            ? palette.ink
            : text;

      return (
        <StyledView
          key={day}
          styled={{ style: [defaults.cell, { height: geometry.day }] }}
        >
          {inBand ? (
            <StyledView
              pointerEvents="none"
              styled={{
                style: [
                  defaults.band,
                  {
                    left: day > from ? 0 : '50%',
                    right: day < to ? 0 : '50%',
                    backgroundColor: palette.container,
                  },
                  day > from &&
                    bandOpensLeft && {
                      borderTopLeftRadius: round,
                      borderBottomLeftRadius: round,
                    },
                  day < to &&
                    bandClosesRight && {
                      borderTopRightRadius: round,
                      borderBottomRightRadius: round,
                    },
                  styled?.styleRange,
                ],
              }}
            />
          ) : null}
          <StyledPressable
            accessibilityRole="button"
            accessibilityLabel={
              spokenDate(day) + role + (isToday ? ', today' : '')
            }
            accessibilityState={{
              selected: isSelected,
              disabled: disabled || isOff,
            }}
            disabled={disabled || isOff}
            onPress={() => press(day)}
            styled={{
              style: [
                defaults.day,
                {
                  width: geometry.day,
                  height: geometry.day,
                  borderRadius: round,
                  backgroundColor: isSelected ? palette.main : 'transparent',
                },
                styled?.styleDay,
                isToday &&
                  !isSelected && {
                    borderWidth: shape.emphasisWidth(1.5),
                    borderColor: palette.ink,
                  },
                isToday && styled?.styleDayToday,
                isSelected && styled?.styleDaySelected,
                isOff && { opacity: DISABLED_OPACITY },
                isOff && styled?.styleDayDisabled,
              ],
            }}
          >
            <Typography
              variant={TYPOGRAPHY_PARTS.body}
              numberOfLines={1}
              style={[
                defaults.dayText,
                { color: dayColor },
                (isSelected || isToday) && { fontWeight: '600' },
                isOff && { textDecorationLine: 'line-through' },
                styled?.styleDayText,
              ]}
            >
              {String(day - firstDay + 1)}
            </Typography>
          </StyledPressable>
        </StyledView>
      );
    };

    const navButton = (delta: number, off: boolean) => (
      <StyledPressable
        accessibilityRole="button"
        accessibilityLabel={delta < 0 ? 'Previous month' : 'Next month'}
        accessibilityState={{ disabled: off }}
        disabled={off}
        onPress={() => goTo(delta)}
        styled={{
          style: [
            defaults.nav,
            {
              width: geometry.nav,
              height: geometry.nav,
              borderRadius: navRound,
            },
            styled?.styleNav,
            off && { opacity: DISABLED_OPACITY },
          ],
        }}
      >
        <Glyph
          name={delta < 0 ? 'chevronLeft' : 'chevronRight'}
          size={geometry.navIcon}
          color={text}
        />
      </StyledPressable>
    );

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.root,
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        <StyledView styled={{ style: defaults.header }}>
          {navButton(-1, prevDisabled)}
          <Typography
            variant={TYPOGRAPHY_PARTS.title}
            numberOfLines={1}
            accessibilityRole="header"
            accessibilityLiveRegion="polite"
            style={[defaults.title, { color: text }, styled?.styleTitle]}
          >
            {`${titles[shown.month - 1]} ${shown.year}`}
          </Typography>
          {navButton(1, nextDisabled)}
        </StyledView>
        <StyledView styled={{ style: defaults.row }}>
          {columnLabels.map((label, index) => (
            <Typography
              key={index}
              variant={TYPOGRAPHY_PARTS.helper}
              numberOfLines={1}
              style={[
                defaults.weekday,
                { color: secondary },
                styled?.styleWeekday,
              ]}
            >
              {label}
            </Typography>
          ))}
        </StyledView>
        <StyledView styled={{ style: { gap: geometry.rowGap } }}>
          {Array.from({ length: rows }, (_, row) => (
            <StyledView key={row} styled={{ style: defaults.row }}>
              {Array.from({ length: 7 }, (__, column) => {
                const day = gridStart + row * 7 + column;
                return day < firstDay || day > lastDay ? (
                  <StyledView
                    key={`blank-${day}`}
                    styled={{
                      style: [defaults.cell, { height: geometry.day }],
                    }}
                  />
                ) : (
                  renderDay(day, column)
                );
              })}
            </StyledView>
          ))}
        </StyledView>
      </StyledView>
    );
  },
);
Calendar.displayName = 'Calendar';

export default Calendar;
