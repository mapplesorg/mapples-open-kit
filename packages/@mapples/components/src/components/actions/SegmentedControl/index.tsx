import {
  forwardRef,
  Fragment,
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
  Icon,
  TYPOGRAPHY_PARTS,
  Tokens,
  Tone,
  useElevation,
  useShape,
  useTones,
} from '@mapples/ui';
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
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
  SegmentedControlVariant,
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
  /**
   * Look: `pill` a soft pill track with a sliding indicator; `outlined` a
   * bordered box (corners from the project shape) with hairline dividers and
   * the active segment filled solid in `tone` with contrast text. Defaults to
   * `pill`.
   */
  variant?: SegmentedControlVariant;
  /** Height: `sm` 36, `md` 44. Defaults to `md`. */
  size?: SegmentedControlSize;
  /** Shows each option's `iconName` before its label. Defaults to `false`. */
  showIcons?: boolean;
  /** Spans the parent's width with equal segments; otherwise each segment sizes to its label. Defaults to `true`. */
  fullWidth?: boolean;
  /** Colour role of the active label (`pill`) or the active fill (`outlined`). Defaults to `neutral` (the text colour). */
  tone?: Tone;
  /** Strikes through the labels of options marked `disabled` (sold-out sizes). Defaults to `false`. */
  strikeDisabled?: boolean;
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
    /** A segment whose option is `disabled`. */
    styleSegmentDisabled?: StyledProp<ViewStyle>;
    /** Every label. */
    styleLabel?: StyledProp<TextStyle>;
    /** The active label. */
    styleLabelActive?: StyledProp<TextStyle>;
    /** The label of a `disabled` option. */
    styleLabelDisabled?: StyledProp<TextStyle>;
    /** The sliding indicator (`pill`). */
    styleIndicator?: StyledProp<ViewStyle>;
    /** The hairlines between segments (`outlined`). */
    styleDivider?: StyledProp<ViewStyle>;
  };
}

interface SegmentLayout {
  x: number;
  width: number;
}

/**
 * Two to five exclusive segments in a pill track with an indicator that
 * slides under the active one — view modes (list/map), periods
 * (day/week/month), units. `variant="outlined"` draws a bordered box with
 * hairline dividers and a solid active segment instead (period selectors,
 * size grids). Not navigation: `Tabs` switches content and a tabs navigator
 * switches screens.
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
      variant = 'pill',
      size = 'md',
      showIcons = false,
      fullWidth = true,
      tone = 'neutral',
      strikeDisabled = false,
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

    const shape = useShape();
    const elevation = useElevation();
    const palette = tones.tone(tone);
    const geometry = SEGMENTED_CONTROL_GEOMETRY[size];
    const isOutlined = variant === 'outlined';
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
      isOutlined ? palette.contrast : palette.ink,
    );
    const inactiveColor = useSlotColor(
      styled?.styleLabel,
      'color',
      tones.resolve(
        isOutlined ? Tokens.color.text : Tokens.color.textSecondary,
      ),
    );
    const segmentHeight = geometry.height - SEGMENTED_CONTROL_INSET * 2;
    // The outlined box follows the project's control corners, capped at a pill.
    const outlinedRadius = Math.min(
      geometry.height / 2,
      shape.control[size].radius,
    );

    return (
      <StyledView
        ref={ref}
        accessibilityRole="tablist"
        styled={{
          style: [
            defaults.root,
            isOutlined
              ? [
                  defaults.outlined,
                  {
                    height: geometry.height,
                    borderRadius: outlinedRadius,
                    borderWidth: shape.borderWidth(1),
                    borderColor: tones.outlineStrong,
                  },
                ]
              : {
                  height: geometry.height,
                  padding: SEGMENTED_CONTROL_INSET,
                  borderRadius: shape.radius.pill,
                  backgroundColor: tones.fill,
                },
            { alignSelf: fullWidth ? 'stretch' : 'flex-start' },
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {isOutlined ? null : (
          <Animated.View
            pointerEvents="none"
            style={[
              defaults.indicator,
              {
                top: SEGMENTED_CONTROL_INSET,
                bottom: SEGMENTED_CONTROL_INSET,
                borderRadius: shape.radius.pill,
                backgroundColor: tones.resolve(Tokens.color.surface),
                boxShadow: elevation,
                borderWidth: tones.isDark ? shape.borderWidth(1) : 0,
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
        )}
        {items.map((option, index) => {
          const isActive = index === activeIndex;
          const isDisabled = disabled || !!option.disabled;
          const color = isActive ? activeColor : inactiveColor;
          return (
            <Fragment key={option.value}>
              {isOutlined && index > 0 ? (
                <StyledView
                  pointerEvents="none"
                  styled={{
                    style: [
                      defaults.divider,
                      {
                        // The grid of the outlined box: as heavy as its frame.
                        width: shape.borderWidth(StyleSheet.hairlineWidth),
                        backgroundColor: tones.outlineStrong,
                      },
                      styled?.styleDivider,
                    ],
                  }}
                />
              ) : null}
              <StyledPressable
                accessibilityRole="tab"
                accessibilityLabel={option.label}
                accessibilityState={{
                  selected: isActive,
                  disabled: isDisabled,
                }}
                disabled={isDisabled}
                onPress={() => setCurrent(option.value)}
                onLayout={(event) => onSegmentLayout(index, event)}
                styled={{
                  style: [
                    defaults.segment,
                    isOutlined
                      ? {
                          alignSelf: 'stretch',
                          paddingHorizontal: geometry.paddingX,
                          backgroundColor: isActive ? palette.main : undefined,
                        }
                      : {
                          height: segmentHeight,
                          paddingHorizontal: geometry.paddingX,
                          borderRadius: shape.radius.pill,
                        },
                    fullWidth && { flex: 1 },
                    styled?.styleSegment,
                    isActive && styled?.styleSegmentActive,
                    !disabled &&
                      !!option.disabled && { opacity: DISABLED_OPACITY },
                    !!option.disabled && styled?.styleSegmentDisabled,
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
                    strikeDisabled && !!option.disabled && defaults.struck,
                    styled?.styleLabel,
                    isActive && styled?.styleLabelActive,
                    !!option.disabled && styled?.styleLabelDisabled,
                  ]}
                >
                  {option.label}
                </Typography>
              </StyledPressable>
            </Fragment>
          );
        })}
      </StyledView>
    );
  },
);
SegmentedControl.displayName = 'SegmentedControl';

export default SegmentedControl;
