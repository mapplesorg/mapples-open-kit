import {
  forwardRef,
  PropsWithChildren,
  ReactNode,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
  withAlpha,
} from '@mapples/style';
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
  dayNumberOf,
  daysInMonth,
  formatDate,
  localToday,
  MONTH_NAMES,
  parseDate,
  parseMonth,
  readWeekdayLabels,
  readWeekStart,
  spokenDate,
  startOfWeek,
  useSlotColor,
} from '../../../internal';

import { defaults } from './defaults';
import {
  CALENDAR_HEATMAP_DEFAULTS,
  CALENDAR_HEATMAP_WEEKDAY_LABELS,
  CalendarHeatmapDay,
  CalendarHeatmapLayout,
  CalendarHeatmapWeekStart,
  heatmapAlpha,
  readHeatmapLevels,
} from './types';

/** Props for {@link CalendarHeatmap}. */
export interface CalendarHeatmapProps extends Omit<ViewProps, 'children'> {
  /** `weeks`: week columns × weekday rows (GitHub style); `month`: one calendar month. Defaults to `weeks`. */
  layout?: CalendarHeatmapLayout;
  /** The activity: `[{ date: 'YYYY-MM-DD', level?, value? }]`; a bare `{date}` counts as the top level. */
  data?: CalendarHeatmapDay[];
  /** `weeks` layout: a day in the last column. Defaults to `today`. */
  endDate?: string;
  /** `weeks` layout: how many week columns. Defaults to `12`. */
  weeks?: number;
  /** `month` layout: the month as `'YYYY-MM'`. Defaults to the month of `today`. */
  month?: string;
  /** Intensity steps including the empty one (≥ 2). Defaults to `4`. */
  levels?: number;
  /** First day of the week: `0` Sunday, `1` Monday. Defaults to `1`. */
  weekStart?: CalendarHeatmapWeekStart;
  /** Shows the weekday labels (a side column for `weeks`, a header row for `month`). Defaults to `true`. */
  showWeekdayLabels?: boolean;
  /** Seven weekday labels starting from Sunday (reordered by `weekStart`). Defaults to `S M T W T F S`. */
  weekdayLabels?: string[];
  /** Shows a "Less … More" scale under the grid. Defaults to `false`. */
  showLegend?: boolean;
  /** The two legend words. Defaults to `['Less', 'More']`. */
  legendLabels?: [string, string];
  /** The outlined current day as `'YYYY-MM-DD'`; later days are drawn empty. Defaults to the device's date. */
  today?: string;
  /** `month` layout: the day of the month inside each cell. Defaults to `true`. */
  showDayNumbers?: boolean;
  /** Cell edge in points. Defaults to `16` for `weeks`; `month` stretches seven equal columns unless set. */
  cellSize?: number;
  /** Space between cells in points. Defaults to `4`. */
  cellGap?: number;
  /** Colour role of the filled cells. Defaults to `primary`. */
  tone?: Tone;
  /** Fires with the `'YYYY-MM-DD'` date of a pressed cell; makes each cell a button. */
  onDayPress?: (date: string) => void;
  /** Styled slots for every visual part. */
  styled?: {
    /** The whole heatmap. */
    style?: StyledProp<ViewStyle>;
    /** Every day cell (`backgroundColor` sets the empty-level colour). */
    styleCell?: StyledProp<ViewStyle>;
    /** The `today` cell, merged over `styleCell`. */
    styleCellToday?: StyledProp<ViewStyle>;
    /** The weekday labels. */
    styleWeekday?: StyledProp<TextStyle>;
    /** The day numbers (`month` layout). */
    styleDayNumber?: StyledProp<TextStyle>;
    /** The legend row. */
    styleLegend?: StyledProp<ViewStyle>;
  };
}

/** Throws unless `value` is a positive integer. */
const assertCount = (value: number, name: string, min: number) => {
  if (!Number.isInteger(value) || value < min) {
    throw new Error(
      `CalendarHeatmap: ${name} (${String(value)}) must be an integer ≥ ${min}`,
    );
  }
};

/**
 * A grid of days tinted by activity — habit streaks (`weeks`, GitHub style)
 * or a month calendar of sessions (`month`). Each day's `level` (or its
 * `value`, bucketed by the data's largest value) picks a tint of the tone,
 * from the muted track at 0 to the full fill at the top level. `today` is
 * outlined and later days are drawn empty.
 *
 * @example
 * ```tsx
 * <CalendarHeatmap
 *   weeks={12}
 *   showLegend
 *   data={[{ date: '2026-10-19', level: 3 }, { date: '2026-10-20', value: 25 }]}
 * />
 * <CalendarHeatmap layout="month" month="2026-10" data={sessions} tone="accent" />
 * ```
 *
 * @public
 */
const CalendarHeatmap: ForwardRefExoticComponent<
  PropsWithChildren<CalendarHeatmapProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<CalendarHeatmapProps>
>(
  (
    {
      layout = 'weeks',
      data,
      endDate,
      weeks = CALENDAR_HEATMAP_DEFAULTS.weeks,
      month,
      levels = CALENDAR_HEATMAP_DEFAULTS.levels,
      weekStart = 1,
      showWeekdayLabels = true,
      weekdayLabels,
      showLegend = false,
      legendLabels = ['Less', 'More'],
      today,
      showDayNumbers = true,
      cellSize,
      cellGap = CALENDAR_HEATMAP_DEFAULTS.cellGap,
      tone = 'primary',
      onDayPress,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const component = 'CalendarHeatmap';
    assertCount(weeks, 'weeks', 1);
    assertCount(levels, 'levels', 2);
    if (cellSize !== undefined && !(cellSize > 0)) {
      throw new Error(
        `${component}: cellSize (${String(cellSize)}) must be positive`,
      );
    }
    if (!(cellGap >= 0)) {
      throw new Error(
        `${component}: cellGap (${String(cellGap)}) must be 0 or more`,
      );
    }
    if (
      !Array.isArray(legendLabels) ||
      legendLabels.length !== 2 ||
      legendLabels.some((label) => typeof label !== 'string')
    ) {
      throw new Error(`${component}: legendLabels must be two strings`);
    }
    const start = readWeekStart(weekStart, component);
    const labelsFromSunday = readWeekdayLabels(
      weekdayLabels,
      CALENDAR_HEATMAP_WEEKDAY_LABELS,
      component,
    );
    const columnLabels = Array.from(
      { length: 7 },
      (_, index) => labelsFromSunday[(start + index) % 7],
    );
    const todayDay =
      today === undefined ? localToday() : parseDate(today, component, 'today');
    const dayLevels = readHeatmapLevels(data, levels, component);

    const tones = useTones();
    const shape = useShape();
    const palette = tones.tone(tone);
    const trackColor = useSlotColor(
      styled?.styleCell,
      'backgroundColor',
      tones.fill,
    );
    const textColor = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const tertiary = tones.resolve(Tokens.color.textTertiary);

    const weeksLayout = layout === 'weeks';
    const fixedSize = weeksLayout
      ? (cellSize ?? CALENDAR_HEATMAP_DEFAULTS.cellSize)
      : cellSize;
    const radius = weeksLayout ? shape.radius.xs : shape.radius.sm;
    const sizeStyle: ViewStyle =
      fixedSize === undefined
        ? defaults.monthCell
        : { width: fixedSize, height: fixedSize };

    const levelOf = (day: number) =>
      day > todayDay ? 0 : (dayLevels.get(day) ?? 0);

    const cellColor = (level: number) =>
      level === 0
        ? trackColor
        : withAlpha(palette.main, heatmapAlpha(level, levels));

    const renderCell = (day: number, dayNumber?: number): ReactNode => {
      const future = day > todayDay;
      const isToday = day === todayDay;
      const level = levelOf(day);
      const alpha = heatmapAlpha(level, levels);
      const style = [
        defaults.cell,
        sizeStyle,
        { borderRadius: radius },
        future && {
          borderWidth: shape.borderWidth(1),
          borderColor: tones.outline,
        },
        styled?.styleCell,
        // After `styleCell`: its `backgroundColor` only sets the empty track, so the level fill stays on top.
        { backgroundColor: future ? 'transparent' : cellColor(level) },
        isToday && {
          borderWidth: shape.emphasisWidth(2),
          borderColor: palette.ink,
        },
        isToday && styled?.styleCellToday,
      ];
      const number =
        dayNumber !== undefined ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            numberOfLines={1}
            style={[
              {
                color: future
                  ? tertiary
                  : alpha >= 0.6
                    ? palette.contrast
                    : textColor,
              },
              styled?.styleDayNumber,
            ]}
          >
            {String(dayNumber)}
          </Typography>
        ) : null;
      const date = formatDate(day);
      if (onDayPress) {
        return (
          <StyledPressable
            key={day}
            accessibilityRole="button"
            accessibilityLabel={`${spokenDate(day)}, level ${level} of ${levels - 1}`}
            onPress={() => onDayPress(date)}
            styled={{ style }}
          >
            {number}
          </StyledPressable>
        );
      }
      return (
        <StyledView key={day} styled={{ style }}>
          {number}
        </StyledView>
      );
    };

    const spacer = (key: string) => (
      <StyledView key={key} styled={{ style: sizeStyle }} />
    );

    const weekdayText = (label: string, index: number, side: boolean) => (
      <Typography
        key={index}
        variant={TYPOGRAPHY_PARTS.helper}
        numberOfLines={1}
        style={[
          side ? defaults.weekdaySide : defaults.weekday,
          { color: secondary },
          side && fixedSize !== undefined
            ? {
                height: fixedSize,
                lineHeight: fixedSize,
                fontSize: Math.min(12, Math.round(fixedSize * 0.7)),
              }
            : !side && fixedSize !== undefined
              ? { width: fixedSize }
              : !side && { flex: 1 },
          styled?.styleWeekday,
        ]}
      >
        {label}
      </Typography>
    );

    let grid: ReactNode;
    let summary: string;
    let activeDays = 0;
    if (weeksLayout) {
      const end =
        endDate === undefined
          ? todayDay
          : parseDate(endDate, component, 'endDate');
      const first = startOfWeek(end, start) - (weeks - 1) * 7;
      const columns = Array.from({ length: weeks }, (_, week) =>
        Array.from({ length: 7 }, (__, row) => first + week * 7 + row),
      );
      activeDays = columns.flat().filter((day) => levelOf(day) > 0).length;
      summary = `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
      grid = (
        <StyledView styled={{ style: [defaults.grid, { gap: cellGap }] }}>
          {showWeekdayLabels ? (
            <StyledView styled={{ style: [defaults.column, { gap: cellGap }] }}>
              {columnLabels.map((label, index) =>
                weekdayText(label, index, true),
              )}
            </StyledView>
          ) : null}
          {columns.map((days) => (
            <StyledView
              key={days[0]}
              styled={{ style: [defaults.column, { gap: cellGap }] }}
            >
              {days.map((day) => renderCell(day))}
            </StyledView>
          ))}
        </StyledView>
      );
    } else {
      const shown =
        month === undefined
          ? datePartsOf(todayDay)
          : parseMonth(month, component, 'month');
      const firstDay = dayNumberOf(shown.year, shown.month, 1);
      const count = daysInMonth(shown.year, shown.month);
      const gridStart = startOfWeek(firstDay, start);
      const rows = Math.ceil((firstDay - gridStart + count) / 7);
      for (let day = firstDay; day < firstDay + count; day += 1) {
        if (levelOf(day) > 0) activeDays += 1;
      }
      summary = `${MONTH_NAMES[shown.month - 1]} ${shown.year}`;
      grid = (
        <StyledView styled={{ style: { gap: cellGap } }}>
          {showWeekdayLabels ? (
            <StyledView styled={{ style: [defaults.row, { gap: cellGap }] }}>
              {columnLabels.map((label, index) =>
                weekdayText(label, index, false),
              )}
            </StyledView>
          ) : null}
          {Array.from({ length: rows }, (_, row) => (
            <StyledView
              key={row}
              styled={{ style: [defaults.row, { gap: cellGap }] }}
            >
              {Array.from({ length: 7 }, (__, column) => {
                const day = gridStart + row * 7 + column;
                return day < firstDay || day >= firstDay + count
                  ? spacer(`blank-${day}`)
                  : renderCell(
                      day,
                      showDayNumbers ? day - firstDay + 1 : undefined,
                    );
              })}
            </StyledView>
          ))}
        </StyledView>
      );
    }

    const legendSize = fixedSize ?? 12;
    const legend = showLegend ? (
      <StyledView styled={{ style: [defaults.legend, styled?.styleLegend] }}>
        <Typography
          variant={TYPOGRAPHY_PARTS.helper}
          style={[defaults.legendLabel, { color: secondary }]}
        >
          {legendLabels[0]}
        </Typography>
        {Array.from({ length: levels }, (_, level) => (
          <StyledView
            key={level}
            styled={{
              style: [
                {
                  width: legendSize,
                  height: legendSize,
                  borderRadius: shape.radius.xs,
                  backgroundColor: cellColor(level),
                },
              ],
            }}
          />
        ))}
        <Typography
          variant={TYPOGRAPHY_PARTS.helper}
          style={[defaults.legendLabel, { color: secondary }]}
        >
          {legendLabels[1]}
        </Typography>
      </StyledView>
    ) : null;

    return (
      <StyledView
        ref={ref}
        accessible={!onDayPress}
        accessibilityRole="image"
        accessibilityLabel={`Activity, ${summary}, ${activeDays} active ${activeDays === 1 ? 'day' : 'days'}`}
        styled={{
          style: [
            weeksLayout ? defaults.rootWeeks : defaults.rootMonth,
            styled?.style,
          ],
        }}
        {...rest}
      >
        {grid}
        {legend}
      </StyledView>
    );
  },
);
CalendarHeatmap.displayName = 'CalendarHeatmap';

export default CalendarHeatmap;
