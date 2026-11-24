import {
  forwardRef,
  PropsWithChildren,
  useEffect,
  useRef,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  requestScrollPage,
  StyledProp,
  StyledView,
  Typography,
  useMotionEnabled,
  useScrollPaging,
} from '@mapples/style';
import {
  DISABLED_OPACITY,
  TYPOGRAPHY_PARTS,
  Tokens,
  Tone,
  useShape,
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
  /**
   * The `name` of a paging scroll view on the same screen (a `ScrollView` or
   * `HorizontalScrollView` with `pagingEnabled`). The control then follows
   * it: the page count is the scroll view's, the current page moves with the
   * swipe, and pressing a dot scrolls there. `onValueChange` still fires with
   * each new page.
   */
  target?: string;
  /** Number of pages; with `target`, what shows on the design canvas and until the scroll view has measured. Defaults to `3`. */
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
 * With `target` it follows a paging scroll view by itself, no state needed.
 *
 * @example
 * ```tsx
 * <PageControl count={slides.length} value={index} onValueChange={setIndex} />
 *
 * <HorizontalScrollView name="gallery" pagingEnabled>…</HorizontalScrollView>
 * <PageControl target="gallery" variant="bars" />
 * ```
 *
 * @public
 */
const PageControl: ForwardRefExoticComponent<
  PropsWithChildren<PageControlProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<PageControlProps>>(
  (
    {
      target,
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
    const shape = useShape();
    const geometry = PAGE_CONTROL_GEOMETRY[size];
    const [current, setCurrent] = useControllableState<number>({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    // A scroll view that has measured owns the pages and the current one.
    // Not where a `MotionProvider` turned motion off (a design canvas): the
    // pages of a scroll view are laid out for editing there, so the control
    // shows `count` dots with the first one active.
    const motionEnabled = useMotionEnabled();
    const paging = useScrollPaging(target);
    const following = motionEnabled && paging.count > 0;
    const pages = following ? paging.count : Math.max(0, Math.floor(count));
    const last = Math.max(pages - 1, 0);
    const index = clamp(following ? paging.page : current, 0, last);

    // Keeps the control's own value (and whatever is bound to it) on the
    // scroll view's page.
    const reported = useRef(current);
    useEffect(() => {
      if (!following || paging.page === reported.current) return;
      reported.current = paging.page;
      setCurrent(paging.page);
    }, [following, paging.page, setCurrent]);

    const goTo = (page: number) => {
      if (target && following) requestScrollPage(target, page);
      else setCurrent(page);
    };

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
      goTo(clamp(index + direction, 0, last));
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
                onPress={() => goTo(page)}
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
                        borderRadius: shape.radius.pill,
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
