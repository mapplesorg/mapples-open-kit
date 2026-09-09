import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useRef,
  useState,
} from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
  useStyled,
} from '@mapples/style';
import {
  DISABLED_OPACITY,
  ELEVATION,
  Icon,
  RADII,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import {
  Animated,
  LayoutChangeEvent,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import {
  Option,
  readOptions,
  useControllableState,
  useSlotColor,
  useTimingValue,
  DURATION,
} from '../../../internal';

import { defaults } from './defaults';
import {
  SEGMENTED_CONTROL_GEOMETRY,
  SEGMENTED_CONTROL_INSET,
  SEGMENTED_CONTROL_OPTION_COUNT,
  SegmentedControlSize,
} from './types';

/** Props for {@link SegmentedControl}. */
export interface SegmentedControlProps extends Omit<ViewProps, 'children'> {
  /** The segments: two to five `{label, value, iconName?, disabled?}` entries. */
  options?: Option[];
  /** Selected value (controlled). Omit to let the control keep its own state. */
  value?: string;
  /** Initial value while uncontrolled. Defaults to the first option. */
  defaultValue?: string;
  /** Fires with the next value — the new value is the first argument. */
  onValueChange?: (value: string) => void;
  /** Height: `sm` 36, `md` 44. Defaults to `md`. */
  size?: SegmentedControlSize;
  /** Shows each option's `iconName` before its label. Defaults to `false`. */
  showIcons?: boolean;
  /** Spans the parent's width with equal segments; otherwise each segment sizes to its label. Defaults to `true`. */
  fullWidth?: boolean;
  /** Colour role of the active label. Defaults to `neutral` (the text colour). */
  tone?: Tone;
  /** Disables interaction and dims the control. */
  disabled?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The track. */
    style?: StyledProp<ViewStyle>;
    /** Every segment. */
    styleSegment?: StyledProp<ViewStyle>;
    /** The active segment. */
    styleSegmentActive?: StyledProp<ViewStyle>;
    /** Every label. */
    styleLabel?: StyledProp<TextStyle>;
    /** The active label. */
    styleLabelActive?: StyledProp<TextStyle>;
    /** The sliding indicator. */
    styleIndicator?: StyledProp<ViewStyle>;
  };
}

interface SegmentLayout {
  x: number;
  width: number;
}

/**
 * Two to five exclusive segments in a pill track with an indicator that
 * slides under the active one — view modes (list/map), periods
 * (day/week/month), units. Not navigation: `Tabs` switches content and a
 * tabs navigator switches screens.
 *
 * @example
 * ```tsx
 * <SegmentedControl
 *   options={[
 *     { label: 'Day', value: 'day' },
 *     { label: 'Week', value: 'week' },
 *     { label: 'Month', value: 'month' },
 *   ]}
 *   value={period}
 *   onValueChange={setPeriod}
 * />
 * ```
 *
 * @public
 */
const SegmentedControl = forwardRef<
  View,
  PropsWithChildren<SegmentedControlProps>
>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      size = 'md',
      showIcons = false,
      fullWidth = true,
      tone = 'neutral',
      disabled = false,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const items = readOptions(options, 'SegmentedControl');
    const { min, max } = SEGMENTED_CONTROL_OPTION_COUNT;
    if (items.length < min || items.length > max) {
      throw new Error(
        `SegmentedControl: options must hold ${min}–${max} entries (got ${items.length})`,
      );
    }

    const tones = useTones();
    const palette = tones.tone(tone);
    const geometry = SEGMENTED_CONTROL_GEOMETRY[size];
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? items[0].value,
      onChange: onValueChange,
    });
    const [layouts, setLayouts] = useState<Record<number, SegmentLayout>>({});
    // The first measurement places the indicator; only later changes slide.
    const [animate, setAnimate] = useState(false);
    const armedRef = useRef(false);

    const onSegmentLayout = useCallback(
      (index: number, event: LayoutChangeEvent) => {
        const { x, width } = event.nativeEvent.layout;
        setLayouts((known) => {
          const previous = known[index];
          if (previous && previous.x === x && previous.width === width) {
            return known;
          }
          return { ...known, [index]: { x, width } };
        });
        if (!armedRef.current) {
          armedRef.current = true;
          setTimeout(() => setAnimate(true), 0);
        }
      },
      [],
    );

    const activeIndex = items.findIndex((option) => option.value === current);
    const active = activeIndex >= 0 ? layouts[activeIndex] : undefined;
    const translateX = useTimingValue(active ? active.x : 0, {
      duration: animate ? DURATION.base : 0,
    });
    const resolved = useStyled({ indicator: styled?.styleIndicator }) as {
      indicator?: ViewStyle;
    };

    const activeColor = useSlotColor(
      styled?.styleLabelActive,
      'color',
      palette.main,
    );
    const inactiveColor = useSlotColor(
      styled?.styleLabel,
      'color',
      tones.resolve(Tokens.color.textSecondary),
    );
    const segmentHeight = geometry.height - SEGMENTED_CONTROL_INSET * 2;

    return (
      <StyledView
        ref={ref}
        accessibilityRole="tablist"
        styled={{
          style: [
            defaults.root,
            {
              height: geometry.height,
              padding: SEGMENTED_CONTROL_INSET,
              borderRadius: RADII.pill,
              backgroundColor: tones.fill,
              alignSelf: fullWidth ? 'stretch' : 'flex-start',
            },
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            defaults.indicator,
            {
              top: SEGMENTED_CONTROL_INSET,
              bottom: SEGMENTED_CONTROL_INSET,
              borderRadius: RADII.pill,
              backgroundColor: tones.resolve(Tokens.color.surface),
              boxShadow: ELEVATION,
              borderWidth: tones.isDark ? 1 : 0,
              borderColor: tones.outline,
            },
            resolved.indicator,
            {
              width: active ? active.width : 0,
              opacity: active ? 1 : 0,
              transform: [{ translateX }],
            },
          ]}
        />
        {items.map((option, index) => {
          const isActive = index === activeIndex;
          const isDisabled = disabled || !!option.disabled;
          const color = isActive ? activeColor : inactiveColor;
          return (
            <StyledPressable
              key={option.value}
              accessibilityRole="tab"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isActive, disabled: isDisabled }}
              disabled={isDisabled}
              onPress={() => setCurrent(option.value)}
              onLayout={(event) => onSegmentLayout(index, event)}
              styled={{
                style: [
                  defaults.segment,
                  {
                    height: segmentHeight,
                    paddingHorizontal: geometry.paddingX,
                    borderRadius: RADII.pill,
                  },
                  fullWidth && { flex: 1 },
                  styled?.styleSegment,
                  isActive && styled?.styleSegmentActive,
                  !disabled &&
                    !!option.disabled && { opacity: DISABLED_OPACITY },
                ],
              }}
            >
              {showIcons && option.iconName ? (
                <Icon
                  iconName={option.iconName}
                  size={geometry.icon}
                  color={color}
                />
              ) : null}
              <Typography
                variant={TYPOGRAPHY_PARTS.label}
                numberOfLines={1}
                style={[
                  { color },
                  styled?.styleLabel,
                  isActive && styled?.styleLabelActive,
                ]}
              >
                {option.label}
              </Typography>
            </StyledPressable>
          );
        })}
      </StyledView>
    );
  },
);
SegmentedControl.displayName = 'SegmentedControl';

export default SegmentedControl;
