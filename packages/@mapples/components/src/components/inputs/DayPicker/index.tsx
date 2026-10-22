import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledScrollView,
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
  datePartsOf,
  localToday,
  parseDate,
  readWeekdayLabels,
  spokenDate,
  useControllableState,
  weekdayOf,
} from '../../../internal';

import { defaults } from './defaults';
import {
  DAY_PICKER_DEFAULTS,
  DAY_PICKER_GEOMETRY,
  DAY_PICKER_WEEKDAY_LABELS,
  DayPickerDay,
  DayPickerDisplay,
  DayPickerMode,
  dayPickerSelection,
  DayPickerValue,
  generateDayPickerDays,
  readDayPickerDays,
} from './types';

/** Props for {@link DayPicker}. */
export interface DayPickerProps extends Omit<ViewProps, 'children'> {
  /** One day at a time (`value` is a date) or several (`value` is a date array). Defaults to `single`. */
  mode?: DayPickerMode;
  /** The cells: `[{ date: 'YYYY-MM-DD', label?, marker?: boolean | Tone, disabled? }]`. Wins over `startDate`/`count`. */
  days?: DayPickerDay[];
  /** First generated day as `'YYYY-MM-DD'` when `days` is not given. Defaults to the device's date. */
  startDate?: string;
  /** How many days to generate from `startDate`. Defaults to `7`. */
  count?: number;
  /** Selection (controlled): a date (`''` for none), or a date array in `multiple` mode. Omit to let the picker keep its own state. */
  value?: DayPickerValue;
  /** Initial selection while uncontrolled. Defaults to none. */
  defaultValue?: DayPickerValue;
  /** Fires with the next selection — the new value is the first argument. */
  onValueChange?: (value: DayPickerValue) => void;
  /** `date`: weekday over the day number; `weekday`: only the weekday, as a toggle. Defaults to `date`. */
  display?: DayPickerDisplay;
  /** Seven weekday names starting from Sunday. Defaults to `Sun`…`Sat`; the `weekday` display shows their first letter unless given. */
  weekdayLabels?: string[];
  /** The outlined current day as `'YYYY-MM-DD'`. */
  today?: string;
  /** Fixed-width cells on one horizontally scrolling line, instead of cells sharing the row. Defaults to `false`. */
  scrollable?: boolean;
  /** Colour role of the selected cells. Defaults to `primary`. */
  tone?: Tone;
  /** Disables every cell. */
  disabled?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row. */
    style?: StyledProp<ViewStyle>;
    /** Every cell. */
    styleCell?: StyledProp<ViewStyle>;
    /** A selected cell. */
    styleCellSelected?: StyledProp<ViewStyle>;
    /** The `today` cell. */
    styleCellToday?: StyledProp<ViewStyle>;
    /** A disabled cell. */
    styleCellDisabled?: StyledProp<ViewStyle>;
    /** The weekday text. */
    styleWeekday?: StyledProp<TextStyle>;
    /** The day number (`date` display). */
    styleDay?: StyledProp<TextStyle>;
    /** The marker dot. */
    styleMarker?: StyledProp<ViewStyle>;
  };
}

/**
 * A horizontal row of day cells — an events or booking date strip, a mood
 * week strip, or "repeat on" weekday toggles for a habit. One day is picked
 * at a time, or several with `mode: 'multiple'`. Cells come from `days`, or
 * are generated from `startDate` for `count` days; dates are plain
 * `'YYYY-MM-DD'` strings and are what the picker reports.
 *
 * @example
 * ```tsx
 * <DayPicker startDate="2026-10-19" today="2026-10-21" value={day} onValueChange={setDay} />
 * <DayPicker display="weekday" mode="multiple" startDate="2026-10-19" defaultValue={['2026-10-19']} />
 * ```
 *
 * @public
 */
const DayPicker: ForwardRefExoticComponent<
  PropsWithChildren<DayPickerProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<DayPickerProps>>(
  (
    {
      mode = 'single',
      days,
      startDate,
      count = DAY_PICKER_DEFAULTS.count,
      value,
      defaultValue,
      onValueChange,
      display = 'date',
      weekdayLabels,
      today,
      scrollable = false,
      tone = 'primary',
      disabled = false,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const component = 'DayPicker';
    const multiple = mode === 'multiple';
    const cells =
      days !== undefined
        ? readDayPickerDays(days, component)
        : generateDayPickerDays(
            startDate === undefined
              ? localToday()
              : parseDate(startDate, component, 'startDate'),
            count,
            component,
          );
    const names = readWeekdayLabels(
      weekdayLabels,
      DAY_PICKER_WEEKDAY_LABELS,
      component,
    );
    const shortNames =
      display === 'weekday' && weekdayLabels === undefined
        ? names.map((name) => name.charAt(0))
        : names;
    const todayDay =
      today === undefined ? undefined : parseDate(today, component, 'today');

    const [current, setCurrent] = useControllableState<DayPickerValue>({
      value,
      defaultValue: defaultValue ?? (multiple ? [] : ''),
      onChange: onValueChange,
    });
    const selected = dayPickerSelection(current);

    const tones = useTones();
    const shape = useShape();
    const palette = tones.tone(tone);
    const text = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const control = shape.control.md;
    const geometry = DAY_PICKER_GEOMETRY;
    const height = display === 'date' ? geometry.date.height : control.height;
    const width =
      display === 'date' ? geometry.date.width : geometry.weekday.width;

    const press = (date: string, isSelected: boolean) => {
      if (!multiple) {
        setCurrent(date);
        return;
      }
      const others = selected.filter((entry) => entry !== date);
      setCurrent(isSelected ? others : [...others, date]);
    };

    const items = cells.map((day) => {
      const isSelected = selected.includes(day.date);
      const isDisabled = disabled || !!day.disabled;
      const isToday = day.dayNumber === todayDay;
      const weekday = day.label ?? shortNames[weekdayOf(day.dayNumber)];
      const markerColor =
        day.marker === undefined || day.marker === false
          ? undefined
          : isSelected
            ? palette.contrast
            : day.marker === true
              ? palette.main
              : tones.tone(day.marker).main;
      const strike: TextStyle | false = !!day.disabled && {
        textDecorationLine: 'line-through',
      };
      const weekdayColor = isSelected
        ? palette.contrast
        : display === 'date'
          ? secondary
          : text;

      return (
        <StyledPressable
          key={day.date}
          accessibilityRole={multiple ? 'checkbox' : 'button'}
          accessibilityLabel={
            spokenDate(day.dayNumber) +
            (day.label ? `, ${day.label}` : '') +
            (isToday ? ', today' : '')
          }
          accessibilityState={
            multiple
              ? { checked: isSelected, disabled: isDisabled }
              : { selected: isSelected, disabled: isDisabled }
          }
          disabled={isDisabled}
          onPress={() => press(day.date, isSelected)}
          styled={{
            style: [
              defaults.cell,
              {
                height,
                borderRadius: control.radius,
                backgroundColor: isSelected ? palette.main : tones.fill,
              },
              scrollable ? { width } : defaults.cellEqual,
              styled?.styleCell,
              isToday && { borderWidth: 2, borderColor: palette.ink },
              isToday && styled?.styleCellToday,
              isSelected && styled?.styleCellSelected,
              !!day.disabled && { opacity: DISABLED_OPACITY },
              !!day.disabled && styled?.styleCellDisabled,
            ],
          }}
        >
          <Typography
            variant={
              display === 'date'
                ? TYPOGRAPHY_PARTS.helper
                : TYPOGRAPHY_PARTS.label
            }
            numberOfLines={1}
            style={[
              defaults.text,
              { color: weekdayColor },
              display === 'weekday' && strike,
              styled?.styleWeekday,
            ]}
          >
            {weekday}
          </Typography>
          {display === 'date' ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.title}
              numberOfLines={1}
              style={[
                defaults.text,
                { color: isSelected ? palette.contrast : text },
                strike,
                styled?.styleDay,
              ]}
            >
              {String(datePartsOf(day.dayNumber).day)}
            </Typography>
          ) : null}
          {markerColor ? (
            <StyledView
              pointerEvents="none"
              styled={{
                style: [
                  defaults.marker,
                  {
                    width: geometry.marker,
                    height: geometry.marker,
                    borderRadius: geometry.marker / 2,
                    backgroundColor: markerColor,
                  },
                  display === 'weekday' && { bottom: 3 },
                  styled?.styleMarker,
                ],
              }}
            />
          ) : null}
        </StyledPressable>
      );
    });

    if (scrollable) {
      return (
        <StyledView
          ref={ref}
          styled={{
            style: [
              defaults.scrollRoot,
              styled?.style,
              disabled && { opacity: DISABLED_OPACITY },
            ],
          }}
          {...rest}
        >
          <StyledScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            styled={{
              contentContainerStyle: [
                defaults.scrollContent,
                { gap: geometry.gap },
              ],
            }}
          >
            {items}
          </StyledScrollView>
        </StyledView>
      );
    }

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.row,
            { gap: geometry.gap },
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {items}
      </StyledView>
    );
  },
);
DayPicker.displayName = 'DayPicker';

export default DayPicker;
