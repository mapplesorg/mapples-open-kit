import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  DISABLED_OPACITY,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useShape,
  useTones,
} from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { useControllableState } from '../../../internal';

import { defaults } from './defaults';
import {
  clampTime,
  formatTime,
  parseTime,
  readMinuteStep,
  readTimeWindow,
  TimeColumnOption,
} from './time';
import TimeColumn from './TimeColumn';
import {
  TIME_PICKER_DEFAULTS,
  TIME_PICKER_FORMATS,
  TIME_PICKER_GEOMETRY,
  TimePickerFormat,
} from './types';

/** Props for {@link TimePicker}. */
export interface TimePickerProps extends Omit<ViewProps, 'children'> {
  /** The time (controlled) as a 24-hour `'HH:mm'` string in either format. Omit to let the picker keep its own state. */
  value?: string;
  /** Initial time while uncontrolled. Defaults to the first pickable time (`minTime`, else `00:00`). */
  defaultValue?: string;
  /** Fires with the next `'HH:mm'` time — the new value is the first argument. */
  onValueChange?: (value: string) => void;
  /** `24h` shows hours 00–23; `12h` shows 1–12 and adds an AM/PM column. Defaults to `24h`. */
  format?: TimePickerFormat;
  /** Minutes between options — an integer from 1 to 30 that divides 60. The value must fall on it. Defaults to `5`. */
  minuteStep?: number;
  /** Earliest pickable time as `'HH:mm'`; earlier options are muted. */
  minTime?: string;
  /** Latest pickable time as `'HH:mm'`; later options are muted. */
  maxTime?: string;
  /** The two period labels of the `12h` format. Defaults to `['AM', 'PM']`. */
  periodLabels?: [string, string];
  /** Colour role of the selection. Defaults to `primary`. */
  tone?: Tone;
  /** Disables every column. */
  disabled?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The picker. */
    style?: StyledProp<ViewStyle>;
    /** The band behind the selected row. */
    styleHighlight?: StyledProp<ViewStyle>;
    /** Every column. */
    styleColumn?: StyledProp<ViewStyle>;
    /** Every option row. */
    styleItem?: StyledProp<ViewStyle>;
    /** Every option's text. */
    styleItemText?: StyledProp<TextStyle>;
    /** The selected options' text. */
    styleItemTextSelected?: StyledProp<TextStyle>;
    /** An option outside `minTime`/`maxTime`. */
    styleItemDisabled?: StyledProp<ViewStyle>;
    /** The `:` between hours and minutes. */
    styleSeparator?: StyledProp<TextStyle>;
  };
}

const pad2 = (value: number) => String(value).padStart(2, '0');

/**
 * A time entry of scrolling columns — hours and minutes (by `minuteStep`),
 * plus AM/PM in the `12h` format — with the selected row highlighted. Each
 * column snaps to an option when a scroll ends, and every option is also
 * pressable. `minTime`/`maxTime` mute the options outside them; a change
 * that would leave the window is pulled to its nearest edge. The value is
 * always a 24-hour `'HH:mm'` string. For a grid of bookable slots use a
 * ChipGroup instead.
 *
 * @example
 * ```tsx
 * <TimePicker value={time} onValueChange={setTime} minuteStep={15} />
 * <TimePicker format="12h" defaultValue="19:30" minTime="09:00" maxTime="21:00" />
 * ```
 *
 * @public
 */
const TimePicker: ForwardRefExoticComponent<
  PropsWithChildren<TimePickerProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<TimePickerProps>>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      format = '24h',
      minuteStep = TIME_PICKER_DEFAULTS.minuteStep,
      minTime,
      maxTime,
      periodLabels = TIME_PICKER_DEFAULTS.periodLabels,
      tone = 'primary',
      disabled = false,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const component = 'TimePicker';
    if (!TIME_PICKER_FORMATS.includes(format)) {
      throw new Error(
        `${component}: format (${String(format)}) must be one of ${TIME_PICKER_FORMATS.join(', ')}`,
      );
    }
    if (
      !Array.isArray(periodLabels) ||
      periodLabels.length !== 2 ||
      periodLabels.some((label) => typeof label !== 'string')
    ) {
      throw new Error(`${component}: periodLabels must be two strings`);
    }
    const step = readMinuteStep(minuteStep, component);
    const window = readTimeWindow(minTime, maxTime, step, component);

    // An empty bound value (a variable not set yet, a field a backend left
    // blank) is no value: the picker shows its default until one is picked.
    const [current, setCurrent] = useControllableState<string>({
      value: value === '' ? undefined : value,
      defaultValue: defaultValue ?? formatTime(window.low),
      onChange: onValueChange,
    });
    const minutes = parseTime(current, component, 'value');
    if (minutes % step !== 0) {
      throw new Error(
        `${component}: value (${current}) must fall on the ${step}-minute step`,
      );
    }
    // A value outside minTime/maxTime (a window that moved on) stays shown,
    // on a muted option, until the user picks again.
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const twelve = format === '12h';
    const pm = hour >= 12;

    const tones = useTones();
    const shape = useShape();
    const palette = tones.tone(tone);
    const text = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const geometry = TIME_PICKER_GEOMETRY;
    const middle = geometry.item * Math.floor(geometry.visible / 2);

    const commit = (next: number) => {
      const time = clampTime(next, window);
      if (time !== minutes) setCurrent(formatTime(time));
    };

    const hourOff = (hour24: number) =>
      hour24 * 60 > window.high || hour24 * 60 + 60 - step < window.low;
    const timeOff = (time: number) => time < window.low || time > window.high;

    const hourOptions: TimeColumnOption[] = twelve
      ? Array.from({ length: 12 }, (_, index) => {
          const label = String(index === 0 ? 12 : index);
          return {
            label,
            accessibilityLabel: `${label} ${periodLabels[pm ? 1 : 0]}`,
            disabled: hourOff(index + (pm ? 12 : 0)),
          };
        })
      : Array.from({ length: 24 }, (_, index) => ({
          label: pad2(index),
          accessibilityLabel: `${index} hours`,
          disabled: hourOff(index),
        }));
    const minuteOptions: TimeColumnOption[] = Array.from(
      { length: 60 / step },
      (_, index) => ({
        label: pad2(index * step),
        accessibilityLabel: `${index * step} minutes`,
        disabled: timeOff(hour * 60 + index * step),
      }),
    );
    const periodOptions: TimeColumnOption[] = [
      {
        label: periodLabels[0],
        accessibilityLabel: periodLabels[0],
        disabled: window.low >= 12 * 60,
      },
      {
        label: periodLabels[1],
        accessibilityLabel: periodLabels[1],
        disabled: window.high < 12 * 60,
      },
    ];

    const columnProps = {
      disabled,
      selectedColor: palette.ink,
      color: secondary,
      styled,
    };

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.root,
            { height: geometry.item * geometry.visible, gap: geometry.gap },
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        <StyledView
          pointerEvents="none"
          styled={{
            style: [
              defaults.highlight,
              {
                top: middle,
                height: geometry.item,
                borderRadius: shape.control.md.radius,
                backgroundColor: palette.container,
              },
              styled?.styleHighlight,
            ],
          }}
        />
        <TimeColumn
          {...columnProps}
          options={hourOptions}
          selectedIndex={twelve ? hour % 12 : hour}
          onSelect={(index) =>
            commit((twelve ? index + (pm ? 12 : 0) : index) * 60 + minute)
          }
        />
        <Typography
          variant={TYPOGRAPHY_PARTS.title}
          accessible={false}
          importantForAccessibility="no"
          style={[
            defaults.separator,
            { width: geometry.separator, color: text },
            styled?.styleSeparator,
          ]}
        >
          :
        </Typography>
        <TimeColumn
          {...columnProps}
          options={minuteOptions}
          selectedIndex={minute / step}
          onSelect={(index) => commit(hour * 60 + index * step)}
        />
        {twelve ? (
          <TimeColumn
            {...columnProps}
            options={periodOptions}
            selectedIndex={pm ? 1 : 0}
            onSelect={(index) =>
              commit(((hour % 12) + (index === 1 ? 12 : 0)) * 60 + minute)
            }
          />
        ) : null}
      </StyledView>
    );
  },
);
TimePicker.displayName = 'TimePicker';

export default TimePicker;
