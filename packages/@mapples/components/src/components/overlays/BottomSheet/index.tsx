import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledProp,
  StyledScrollView,
  StyledView,
  Typography,
} from '@mapples/style';
import { RADII, Tokens, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import {
  DimensionValue,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { OverlayRoot, useControllableState } from '../../../internal';

import { defaults } from './defaults';

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
  /** Fixed height (points or percent); omit to size to the content. */
  height?: DimensionValue;
  /** Scrolls the content when it exceeds `maxHeight`. Defaults to `true`. */
  scrollable?: boolean;
  /** Height cap of the sheet. Defaults to `'80%'`. */
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
  };
}

const DISMISS_DISTANCE = 80;
const DISMISS_VELOCITY = 800;

/**
 * A sheet that slides up from the bottom with a grabber, an optional title
 * and scrollable children — pickers, filters, quick details. A downward
 * flick on the header dismisses it. It paints over the parent it is placed
 * in, so it belongs as the LAST child of the page root; `visible` is two-way
 * bindable.
 *
 * @example
 * ```tsx
 * <BottomSheet visible={open} onVisibleChange={setOpen} title="Sort by">
 *   <RadioGroup options={sortOptions} value={sort} onValueChange={setSort} />
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
    const [isVisible, setVisible] = useControllableState<boolean>({
      value: visible,
      defaultValue: defaultVisible,
      onChange: onVisibleChange,
    });

    const close = useCallback(() => {
      setVisible(false);
      onDismiss?.();
    }, [onDismiss, setVisible]);

    const drag = Gesture.Pan()
      .runOnJS(true)
      .activeOffsetY(8)
      .onEnd((event) => {
        if (
          event.translationY > DISMISS_DISTANCE ||
          event.velocityY > DISMISS_VELOCITY
        ) {
          close();
        }
      });

    const content = (
      <StyledView styled={{ style: [defaults.content, styled?.styleContent] }}>
        {children}
      </StyledView>
    );

    return (
      <OverlayRoot
        ref={ref}
        visible={isVisible}
        align="bottom"
        enter="slide-up"
        dismissOnBackdrop={dismissOnBackdrop}
        onDismiss={close}
        style={styled?.style}
        styleBackdrop={styled?.styleBackdrop}
        modal
        testID={testID}
      >
        <StyledView
          accessibilityViewIsModal
          styled={{
            style: [
              defaults.sheet,
              {
                maxHeight,
                height,
                borderTopLeftRadius: RADII.xl,
                borderTopRightRadius: RADII.xl,
                backgroundColor: tones.resolve(Tokens.color.surface),
                borderTopWidth: tones.isDark ? 1 : 0,
                borderColor: tones.outline,
              },
              styled?.styleSheet,
            ],
          }}
          {...rest}
        >
          <GestureDetector gesture={drag}>
            <StyledView styled={{ style: defaults.header }}>
              {showHandle ? (
                <StyledView
                  accessibilityRole="button"
                  accessibilityLabel="Drag down to dismiss"
                  styled={{
                    style: [
                      defaults.handle,
                      { backgroundColor: tones.outlineStrong },
                      styled?.styleHandle,
                    ],
                  }}
                />
              ) : null}
              {title ? (
                <Typography
                  variant={TYPOGRAPHY_PARTS.title}
                  accessibilityRole="header"
                  style={[
                    {
                      color: tones.resolve(Tokens.color.text),
                      alignSelf: 'stretch',
                    },
                    styled?.styleTitle,
                  ]}
                >
                  {title}
                </Typography>
              ) : null}
            </StyledView>
          </GestureDetector>
          {scrollable ? (
            <StyledScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              styled={{ style: { flexGrow: 0 } }}
            >
              {content}
            </StyledScrollView>
          ) : (
            content
          )}
        </StyledView>
      </OverlayRoot>
    );
  },
);
BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;
