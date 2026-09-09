import { forwardRef, PropsWithChildren } from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  DISABLED_OPACITY,
  RADII,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import {
  AccessibilityActionEvent,
  Pressable,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { useControllableState, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  PAGE_CONTROL_GEOMETRY,
  PageControlSize,
  PageControlVariant,
} from './types';

/** Props for {@link PageControl}. */
export interface PageControlProps extends Omit<ViewProps, 'children'> {
  /** Number of pages. Defaults to `3`. */
  count?: number;
  /** Index of the current page (controlled). Omit to let the control keep its own state. */
  value?: number;
  /** Initial index while uncontrolled. Defaults to `0`. */
  defaultValue?: number;
  /** Fires with the next index — the new value is the first argument. */
  onValueChange?: (value: number) => void;
  /** Dot size: `sm` 6, `md` 8. Defaults to `md`. */
  size?: PageControlSize;
  /** Colour role of the active indicator. Defaults to `primary`. */
  tone?: Tone;
  /** Indicator style: round dots, a stretched active bar, or '1 / 3'. Defaults to `dots`. */
  variant?: PageControlVariant;
  /** Disables interaction and dims the control. */
  disabled?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row. */
    style?: StyledProp<ViewStyle>;
    /** An inactive indicator. */
    styleDot?: StyledProp<ViewStyle>;
    /** The active indicator. */
    styleDotActive?: StyledProp<ViewStyle>;
    /** The numeric label. */
    styleLabel?: StyledProp<TextStyle>;
  };
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Page indicators under a carousel or onboarding pager. `value` is the
 * current index, two-way bindable so it can mirror a carousel; dots are
 * pressable and screen readers step through the pages as an adjustable.
 *
 * @example
 * ```tsx
 * <PageControl count={slides.length} value={index} onValueChange={setIndex} />
 * ```
 *
 * @public
 */
const PageControl = forwardRef<View, PropsWithChildren<PageControlProps>>(
  (
    {
      count = 3,
      value,
      defaultValue = 0,
      onValueChange,
      size = 'md',
      tone = 'primary',
      variant = 'dots',
      disabled = false,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const geometry = PAGE_CONTROL_GEOMETRY[size];
    const [current, setCurrent] = useControllableState<number>({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const pages = Math.max(0, Math.floor(count));
    const last = Math.max(pages - 1, 0);
    const index = clamp(current, 0, last);

    const inactiveColor = useSlotColor(
      styled?.styleDot,
      'backgroundColor',
      tones.outlineStrong,
    );
    const activeColor = useSlotColor(
      styled?.styleDotActive,
      'backgroundColor',
      tones.tone(tone).main,
    );

    const onAccessibilityAction = (event: AccessibilityActionEvent) => {
      if (disabled) return;
      const direction = event.nativeEvent.actionName === 'increment' ? 1 : -1;
      setCurrent(clamp(index + direction, 0, last));
    };

    const label = `${pages === 0 ? 0 : index + 1} / ${pages}`;

    return (
      <StyledView
        ref={ref}
        accessibilityRole="adjustable"
        accessibilityValue={{ min: 0, max: last, now: index, text: label }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        accessibilityState={{ disabled }}
        onAccessibilityAction={onAccessibilityAction}
        styled={{
          style: [
            defaults.root,
            { gap: geometry.gap },
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {variant === 'numeric' ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            style={[
              { color: tones.resolve(Tokens.color.textSecondary) },
              styled?.styleLabel,
            ]}
          >
            {label}
          </Typography>
        ) : (
          Array.from({ length: pages }, (_, page) => {
            const active = page === index;
            return (
              <Pressable
                key={page}
                accessibilityRole="button"
                accessibilityLabel={`Page ${page + 1}`}
                accessibilityState={{ selected: active, disabled }}
                disabled={disabled}
                hitSlop={6}
                onPress={() => setCurrent(page)}
              >
                <StyledView
                  styled={{
                    style: [
                      {
                        width:
                          variant === 'bars' && active
                            ? geometry.bar
                            : geometry.dot,
                        height: geometry.dot,
                        borderRadius: RADII.pill,
                        backgroundColor: active ? activeColor : inactiveColor,
                      },
                      styled?.styleDot,
                      active && styled?.styleDotActive,
                    ],
                  }}
                />
              </Pressable>
            );
          })
        )}
      </StyledView>
    );
  },
);
PageControl.displayName = 'PageControl';

export default PageControl;
