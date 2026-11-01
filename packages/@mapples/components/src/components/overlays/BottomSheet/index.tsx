import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledProp,
  StyledScrollView,
  StyledView,
  Typography,
  useStyle,
} from '@mapples/style';
import {
  Button,
  IconButton,
  TYPOGRAPHY_PARTS,
  Tokens,
  useElevation,
  useShape,
  useTones,
} from '@mapples/ui';
import {
  AccessibilityActionEvent,
  Animated,
  DimensionValue,
  TextStyle,
  useWindowDimensions,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import {
  DURATION,
  EASING,
  OverlayRoot,
  useControllableState,
  useReduceMotion,
} from '../../../internal';

import { defaults } from './defaults';
import {
  BottomSheetFooterAction,
  readBottomSheetFooterActions,
  readSnapIndex,
  resolveSnapHeights,
} from './types';

export * from './types';

/** Props for {@link BottomSheet}. */
export interface BottomSheetProps extends Omit<ViewProps, 'children'> {
  /** Whether the sheet is shown (controlled). Omit to let it keep its own state. */
  visible?: boolean;
  /** Initial state while uncontrolled. Defaults to `false`. */
  defaultVisible?: boolean;
  /** Fires with the next visibility — `false` on every dismissal. */
  onVisibleChange?: (visible: boolean) => void;
  /** Fires when the sheet is dismissed by the scrim or a downward drag. */
  onDismiss?: () => void;
  /** Heading under the grabber. */
  title?: string;
  /** Shows the drag grabber. Defaults to `true`. */
  showHandle?: boolean;
  /** Whether tapping the scrim dismisses. Defaults to `true`. */
  dismissOnBackdrop?: boolean;
  /**
   * Modal (the default): a scrim covers the page, screen readers stay in the
   * sheet and a downward drag dismisses. `false` docks a persistent sheet
   * over the page (a results list over a map): no scrim, the page behind
   * stays interactive and a drag never dismisses.
   */
  modal?: boolean;
  /**
   * Heights the sheet rests at, ascending: points (> 1) or screen fractions
   * (0–1], e.g. `[120, 0.5, 0.9]`. Set, dragging the header moves between
   * them and `height`/`maxHeight` do not apply. Malformed values throw.
   */
  snapPoints?: number[];
  /** Snap point the sheet opens at. Defaults to `0` (the lowest). */
  defaultSnapIndex?: number;
  /** Fires with the index of the snap point the sheet settles at. */
  onSnapChange?: (index: number) => void;
  /** Glyph of a header button left of the title (`close`, `arrow-back`); needs `leadingLabel`. */
  leadingIconName?: string;
  /** Screen-reader label of the leading button — required with `leadingIconName`. */
  leadingLabel?: string;
  /** Fires when the leading button is pressed. */
  onLeadingPress?: () => void;
  /**
   * Up to two buttons pinned below the scrolling content (`[{label, value,
   * variant?}]`) — the last is `filled`, the one before `outlined` unless set.
   */
  footerActions?: BottomSheetFooterAction[];
  /** Text at the start of the footer bar (a total, a selection count). */
  footerText?: string;
  /** Fires with the pressed footer button's `value`. */
  onFooterActionPress?: (value: string) => void;
  /** Fixed height (points or percent); omit to size to the content. Not with `snapPoints`. */
  height?: DimensionValue;
  /** Scrolls the content when it exceeds `maxHeight`. Defaults to `true`. */
  scrollable?: boolean;
  /** Height cap of the sheet. Defaults to `'80%'`; ignored with `snapPoints`. */
  maxHeight?: DimensionValue;
  /** Styled slots for every visual part. */
  styled?: {
    /** The overlay layer (absolute fill). */
    style?: StyledProp<ViewStyle>;
    /** The scrim. */
    styleBackdrop?: StyledProp<ViewStyle>;
    /** The sheet surface. */
    styleSheet?: StyledProp<ViewStyle>;
    /** The grabber. */
    styleHandle?: StyledProp<ViewStyle>;
    /** The heading. */
    styleTitle?: StyledProp<TextStyle>;
    /** The content area (padding, gap). */
    styleContent?: StyledProp<ViewStyle>;
    /** The footer bar. */
    styleFooter?: StyledProp<ViewStyle>;
    /** The footer text. */
    styleFooterText?: StyledProp<TextStyle>;
  };
}

const DISMISS_DISTANCE = 80;
const DISMISS_VELOCITY = 800;
/** Seconds of release velocity added to a drag before picking a snap point. */
const SNAP_PROJECTION = 0.15;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * A sheet that slides up from the bottom with a grabber, an optional title
 * and scrollable children — pickers, filters, quick details. A downward
 * flick on the header dismisses it. It paints over the parent it is placed
 * in, so it belongs as the LAST child of the page root; `visible` is two-way
 * bindable.
 *
 * `modal={false}` docks it over the page instead (results over a map) with
 * `snapPoints` to drag between; `footerActions` pin a button bar below the
 * scrolling content; `leadingIconName` puts a close button left of the title.
 *
 * @example
 * ```tsx
 * <BottomSheet visible={open} onVisibleChange={setOpen} title="Sort by">
 *   <RadioGroup options={sortOptions} value={sort} onValueChange={setSort} />
 * </BottomSheet>
 * ```
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   visible
 *   modal={false}
 *   snapPoints={[120, 0.5, 0.9]}
 *   defaultSnapIndex={1}
 *   title="48 stays"
 *   footerActions={[{ label: 'Show list', value: 'list' }]}
 *   onFooterActionPress={showList}
 * >
 *   {results}
 * </BottomSheet>
 * ```
 *
 * @public
 */
const BottomSheet: ForwardRefExoticComponent<
  PropsWithChildren<BottomSheetProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<BottomSheetProps>>(
  (
    {
      visible,
      defaultVisible = false,
      onVisibleChange,
      onDismiss,
      title,
      showHandle = true,
      dismissOnBackdrop = true,
      modal = true,
      snapPoints,
      defaultSnapIndex,
      onSnapChange,
      leadingIconName,
      leadingLabel,
      onLeadingPress,
      footerActions,
      footerText,
      onFooterActionPress,
      height,
      scrollable = true,
      maxHeight = '80%',
      styled,
      children,
      testID,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    // The elevation cast upwards — a docked sheet floats over the page.
    const elevationUp = useElevation('up');
    const reduceMotion = useReduceMotion();
    const [isVisible, setVisible] = useControllableState<boolean>({
      value: visible,
      defaultValue: defaultVisible,
      onChange: onVisibleChange,
    });

    if (leadingIconName && !leadingLabel) {
      throw new Error(
        'BottomSheet: leadingLabel is required with leadingIconName (the screen-reader label of the leading button)',
      );
    }
    const footer = readBottomSheetFooterActions(footerActions);
    const hasFooter = footer.length > 0 || !!footerText;

    // Fractions are of the screen: the device on the canvas (a browser
    // window is taller than the phone frame), the window in an app.
    const { height: windowHeight } = useWindowDimensions();
    const { _canvas } = useStyle();
    const screenHeight = _canvas ? _canvas.height : windowHeight;
    const snapHeights = useMemo(
      () => resolveSnapHeights(snapPoints, screenHeight),
      [snapPoints, screenHeight],
    );
    if (snapHeights && height !== undefined && height !== null) {
      throw new Error(
        'BottomSheet: height and snapPoints are exclusive — the snap points set the height',
      );
    }
    // `null` is an unset inspector field, like `undefined`.
    const startIndex = snapHeights
      ? readSnapIndex(defaultSnapIndex ?? 0, snapHeights)
      : 0;

    const [snapIndex, setSnapIndex] = useState(startIndex);
    // Fewer snap points than before (an edit) leave the sheet at the top one.
    const currentIndex = snapHeights
      ? Math.min(snapIndex, snapHeights.length - 1)
      : 0;
    const indexRef = useRef(currentIndex);
    indexRef.current = currentIndex;
    const [sheetHeight] = useState(
      () => new Animated.Value(snapHeights?.[startIndex] ?? 0),
    );
    const dragStart = useRef(0);

    // Jump (no animation) to the current snap point when the heights change
    // — a rotation, a new viewport, edited snap points.
    const heightsKey = snapHeights?.join(',');
    useEffect(() => {
      if (snapHeights) sheetHeight.setValue(snapHeights[indexRef.current]);
      // `heightsKey` stands for `snapHeights` by value.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [heightsKey, sheetHeight]);

    // Every showing opens at `defaultSnapIndex`.
    const wasVisible = useRef(isVisible);
    useEffect(() => {
      if (isVisible && !wasVisible.current && snapHeights) {
        setSnapIndex(startIndex);
        indexRef.current = startIndex;
        sheetHeight.setValue(snapHeights[startIndex]);
      }
      wasVisible.current = isVisible;
    }, [isVisible, sheetHeight, snapHeights, startIndex]);

    const close = useCallback(() => {
      setVisible(false);
      onDismiss?.();
    }, [onDismiss, setVisible]);

    const settle = useCallback(
      (index: number) => {
        if (!snapHeights) return;
        Animated.timing(sheetHeight, {
          toValue: snapHeights[index],
          duration: reduceMotion ? 0 : DURATION.base,
          easing: EASING,
          // Height is layout — the native driver cannot animate it.
          useNativeDriver: false,
        }).start();
        if (index !== indexRef.current) {
          indexRef.current = index;
          setSnapIndex(index);
          onSnapChange?.(index);
        }
      },
      [onSnapChange, reduceMotion, sheetHeight, snapHeights],
    );

    const drag = Gesture.Pan()
      .runOnJS(true)
      .activeOffsetY([-8, 8])
      .onStart(() => {
        if (snapHeights) dragStart.current = snapHeights[indexRef.current];
      })
      .onUpdate((event) => {
        if (!snapHeights) return;
        // A modal sheet follows the finger down towards dismissal; a docked
        // one stops at its lowest snap point.
        const lowest = modal ? 0 : snapHeights[0];
        sheetHeight.setValue(
          clamp(
            dragStart.current - event.translationY,
            lowest,
            snapHeights[snapHeights.length - 1],
          ),
        );
      })
      .onEnd((event) => {
        const flickedDown =
          event.translationY > DISMISS_DISTANCE ||
          event.velocityY > DISMISS_VELOCITY;
        if (!snapHeights) {
          if (modal && flickedDown) close();
          return;
        }
        if (modal && indexRef.current === 0 && flickedDown) {
          close();
          return;
        }
        const projected =
          dragStart.current -
          event.translationY -
          event.velocityY * SNAP_PROJECTION;
        let nearest = 0;
        snapHeights.forEach((snap, index) => {
          if (
            Math.abs(snap - projected) <
            Math.abs(snapHeights[nearest] - projected)
          ) {
            nearest = index;
          }
        });
        settle(nearest);
      });

    const onHandleAccessibilityAction = (event: AccessibilityActionEvent) => {
      if (!snapHeights) return;
      const step = event.nativeEvent.actionName === 'increment' ? 1 : -1;
      settle(clamp(indexRef.current + step, 0, snapHeights.length - 1));
    };

    const content = (
      <StyledView
        styled={{
          style: [
            defaults.content,
            snapHeights && !scrollable && defaults.fill,
            styled?.styleContent,
          ],
        }}
      >
        {children}
      </StyledView>
    );

    const handleA11y = snapHeights
      ? {
          accessibilityRole: 'adjustable' as const,
          accessibilityLabel: 'Sheet height',
          accessibilityValue: {
            min: 0,
            max: snapHeights.length - 1,
            now: currentIndex,
          },
          accessibilityActions: [
            { name: 'increment' as const },
            { name: 'decrement' as const },
          ],
          onAccessibilityAction: onHandleAccessibilityAction,
        }
      : modal
        ? {
            accessibilityRole: 'button' as const,
            accessibilityLabel: 'Drag down to dismiss',
          }
        : { accessible: false };

    const surface = (
      <StyledView
        accessibilityViewIsModal={modal}
        styled={{
          style: [
            defaults.sheet,
            snapHeights
              ? defaults.fill
              : {
                  maxHeight,
                  height,
                },
            {
              borderTopLeftRadius: shape.radius.xl,
              borderTopRightRadius: shape.radius.xl,
              backgroundColor: tones.resolve(Tokens.color.surface),
              borderTopWidth: tones.isDark ? shape.borderWidth(1) : 0,
              borderColor: tones.outline,
            },
            !modal && { boxShadow: elevationUp },
            styled?.styleSheet,
          ],
        }}
        {...rest}
      >
        <GestureDetector gesture={drag}>
          <StyledView styled={{ style: defaults.header }}>
            {showHandle ? (
              <StyledView
                {...handleA11y}
                styled={{
                  style: [
                    defaults.handle,
                    { backgroundColor: tones.outlineStrong },
                    styled?.styleHandle,
                  ],
                }}
              />
            ) : null}
            {title || leadingIconName ? (
              <StyledView styled={{ style: defaults.titleRow }}>
                {leadingIconName ? (
                  <IconButton
                    iconName={leadingIconName}
                    accessibilityLabel={leadingLabel}
                    variant="standard"
                    tone="neutral"
                    onPress={onLeadingPress}
                  />
                ) : null}
                {title ? (
                  <Typography
                    variant={TYPOGRAPHY_PARTS.title}
                    accessibilityRole="header"
                    style={[
                      {
                        color: tones.resolve(Tokens.color.text),
                        flex: 1,
                      },
                      styled?.styleTitle,
                    ]}
                  >
                    {title}
                  </Typography>
                ) : null}
              </StyledView>
            ) : null}
          </StyledView>
        </GestureDetector>
        {scrollable ? (
          <StyledScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            styled={{ style: snapHeights ? defaults.fill : { flexGrow: 0 } }}
          >
            {content}
          </StyledScrollView>
        ) : (
          content
        )}
        {hasFooter ? (
          <StyledView
            styled={{
              style: [
                defaults.footer,
                { borderTopColor: tones.divider },
                styled?.styleFooter,
              ],
            }}
          >
            {footerText ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.title}
                numberOfLines={1}
                style={[
                  { color: tones.resolve(Tokens.color.text) },
                  defaults.fill,
                  styled?.styleFooterText,
                ]}
              >
                {footerText}
              </Typography>
            ) : null}
            {footer.map((action, index) => (
              <Button
                key={action.value}
                label={action.label}
                variant={
                  action.variant ??
                  (index === footer.length - 1 ? 'filled' : 'outlined')
                }
                size="lg"
                // Beside a footer text the buttons size to their labels;
                // alone they share the bar.
                styled={footerText ? undefined : { style: defaults.fill }}
                onPress={() => onFooterActionPress?.(action.value)}
              />
            ))}
          </StyledView>
        ) : null}
      </StyledView>
    );

    return (
      <OverlayRoot
        ref={ref}
        visible={isVisible}
        align="bottom"
        enter="slide-up"
        backdrop={modal}
        dismissOnBackdrop={dismissOnBackdrop}
        onDismiss={close}
        style={styled?.style}
        styleBackdrop={styled?.styleBackdrop}
        modal={modal}
        testID={testID}
      >
        {snapHeights ? (
          <Animated.View style={{ height: sheetHeight }}>
            {surface}
          </Animated.View>
        ) : (
          surface
        )}
      </OverlayRoot>
    );
  },
);
BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;
