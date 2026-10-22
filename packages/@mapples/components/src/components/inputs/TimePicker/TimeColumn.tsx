import { FC, useEffect, useRef, useState, type ComponentRef } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import { DISABLED_OPACITY, TYPOGRAPHY_PARTS } from '@mapples/ui';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { defaults } from './defaults';
import { TimeColumnOption } from './time';
import { TIME_PICKER_GEOMETRY } from './types';

/** Props for {@link TimeColumn}. */
export interface TimeColumnProps {
  /** The options, top to bottom. */
  options: TimeColumnOption[];
  /** Index of the option in the middle row. */
  selectedIndex: number;
  /** Fires with the index of a pressed option or of the one a scroll settles on. */
  onSelect: (index: number) => void;
  /** Disables pressing and scrolling. */
  disabled: boolean;
  /** Text colour of the selected option. */
  selectedColor: string;
  /** Text colour of the other options. */
  color: string;
  /** Styled slots handed down from the picker. */
  styled?: {
    /** The column. */
    styleColumn?: StyledProp<ViewStyle>;
    /** Every option row. */
    styleItem?: StyledProp<ViewStyle>;
    /** Every option's text. */
    styleItemText?: StyledProp<TextStyle>;
    /** The selected option's text. */
    styleItemTextSelected?: StyledProp<TextStyle>;
    /** An option outside minTime/maxTime. */
    styleItemDisabled?: StyledProp<ViewStyle>;
  };
}

/** Quiet time after the last scroll event before the column snaps and commits. */
const SETTLE_MS = 120;

/** The enabled option nearest to `index` (the index itself when enabled). */
const nearestEnabled = (
  options: TimeColumnOption[],
  index: number,
): number | undefined => {
  for (let distance = 0; distance < options.length; distance += 1) {
    const before = index - distance;
    if (before >= 0 && !options[before].disabled) return before;
    const after = index + distance;
    if (after < options.length && !options[after].disabled) return after;
  }
  return undefined;
};

/**
 * One scrolling column of {@link TimePicker}. The middle row is the
 * selection; a scroll settles (snap on native, a short quiet period on the
 * web) on the nearest enabled option and reports it, and every option is
 * also pressable.
 */
const TimeColumn: FC<TimeColumnProps> = ({
  options,
  selectedIndex,
  onSelect,
  disabled,
  selectedColor,
  color,
  styled,
}) => {
  const { item, visible, column } = TIME_PICKER_GEOMETRY;
  const pad = item * Math.floor(visible / 2);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const offset = useRef(0);
  const dragging = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const laidOut = useRef(false);
  // Bumped after every settle so the position effect re-checks alignment
  // even when the selection did not change (a controlled value kept as is).
  const [settles, setSettles] = useState(0);

  useEffect(() => {
    const target = selectedIndex * item;
    if (Math.abs(offset.current - target) < 1) return;
    scrollRef.current?.scrollTo({ y: target, animated: laidOut.current });
  }, [item, selectedIndex, settles]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const settle = () => {
    const raw = Math.round(offset.current / item);
    const index = nearestEnabled(
      options,
      Math.min(options.length - 1, Math.max(0, raw)),
    );
    if (index === undefined) return;
    if (index !== selectedIndex) onSelect(index);
    setSettles((count) => count + 1);
  };

  const schedule = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(settle, SETTLE_MS);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    offset.current = event.nativeEvent.contentOffset.y;
    if (!dragging.current) schedule();
  };

  return (
    <StyledView
      styled={{
        style: [
          defaults.column,
          { width: column, height: item * visible },
          styled?.styleColumn,
        ],
      }}
    >
      <ScrollView
        ref={scrollRef}
        scrollEnabled={!disabled}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        snapToInterval={item}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: pad }}
        onLayout={() => {
          if (laidOut.current) return;
          laidOut.current = true;
          const target = selectedIndex * item;
          if (Math.abs(offset.current - target) >= 1) {
            scrollRef.current?.scrollTo({ y: target, animated: false });
          }
        }}
        onScroll={onScroll}
        onScrollBeginDrag={() => {
          dragging.current = true;
          clearTimeout(timer.current);
        }}
        onScrollEndDrag={() => {
          dragging.current = false;
          schedule();
        }}
      >
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;
          return (
            <StyledPressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={option.accessibilityLabel}
              accessibilityState={{
                selected: isSelected,
                disabled: disabled || option.disabled,
              }}
              disabled={disabled || option.disabled}
              onPress={() => onSelect(index)}
              styled={{
                style: [
                  defaults.item,
                  { height: item },
                  styled?.styleItem,
                  option.disabled && { opacity: DISABLED_OPACITY },
                  option.disabled && styled?.styleItemDisabled,
                ],
              }}
            >
              <Typography
                variant={TYPOGRAPHY_PARTS.title}
                numberOfLines={1}
                style={[
                  defaults.itemText,
                  { color: isSelected ? selectedColor : color },
                  isSelected && { fontWeight: '600' },
                  styled?.styleItemText,
                  isSelected && styled?.styleItemTextSelected,
                ]}
              >
                {option.label}
              </Typography>
            </StyledPressable>
          );
        })}
      </ScrollView>
    </StyledView>
  );
};

export default TimeColumn;
