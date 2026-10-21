import {
  forwardRef,
  PropsWithChildren,
  useMemo,
  type ComponentProps,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, useStyle, useStyled } from '@mapples/style';
import { useTones } from '@mapples/ui';
import {
  Animated,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

import useOverlayPresence from '../useOverlayPresence';

import Backdrop from './Backdrop';

export type OverlayAlign = 'center' | 'bottom' | 'top';
export type OverlayEnter = 'fade' | 'scale' | 'slide-up' | 'slide-down';

export interface OverlayRootProps {
  /** Whether the overlay is shown; it stays mounted through the exit animation. */
  visible: boolean;
  /** Where the content sits. */
  align: OverlayAlign;
  /** Entrance transition of the content. */
  enter: OverlayEnter;
  /** Whether a scrim is painted behind the content. */
  backdrop?: boolean;
  /** Whether tapping the scrim dismisses. */
  dismissOnBackdrop?: boolean;
  /** Fires when the scrim is tapped (with `dismissOnBackdrop`). */
  onDismiss?: () => void;
  /** Author slot for the outer root (the absolute-fill layer). */
  style?: StyledProp<ViewStyle>;
  /** Author slot for the scrim. */
  styleBackdrop?: StyledProp<ViewStyle>;
  /** Layering among siblings; defaults to 1000. */
  zIndex?: number;
  /** Marks the content as modal for screen readers. */
  modal?: boolean;
  testID?: string;
}

const OVERLAY_Z_INDEX = 1000;

/**
 * The shared root of Dialog, BottomSheet, ActionSheet and Snackbar. It is the
 * component's OWN outer view: `position: absolute` with every inset at 0, so
 * it covers the parent it is placed in — the page root, which the canvas
 * keeps at least a device tall and a built app keeps one screen tall. The
 * layer is also at least one viewport tall (a web page may scroll): the
 * device height when a style provider declares canvas dimensions, the window
 * height otherwise. The window is wrong on the canvas — a browser window is
 * taller than a phone frame, so centred and bottom content landed below the
 * frame. A hidden overlay renders nothing once its exit animation has played.
 */
const OverlayRoot: ForwardRefExoticComponent<
  PropsWithChildren<OverlayRootProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<OverlayRootProps>>(
  (
    {
      visible,
      align,
      enter,
      backdrop = true,
      dismissOnBackdrop = true,
      onDismiss,
      style,
      styleBackdrop,
      zIndex = OVERLAY_Z_INDEX,
      modal = false,
      testID,
      children,
    },
    ref,
  ) => {
    const { mounted, progress } = useOverlayPresence(visible);
    const tones = useTones();
    const { height: windowHeight } = useWindowDimensions();
    const { _canvas } = useStyle();
    const viewportHeight = _canvas ? _canvas.height : windowHeight;

    const contentStyle = useMemo(() => {
      const scale = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.96, 1],
      });
      const translateY = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [enter === 'slide-up' ? 24 : -24, 0],
      });
      const transform = [
        ...(enter === 'scale' ? [{ scale }] : []),
        ...(enter === 'slide-up' || enter === 'slide-down'
          ? [{ translateY }]
          : []),
      ];
      // RN's transform typing does not accept interpolations in a union
      // array; the runtime does.
      return {
        opacity: progress,
        transform,
      } as unknown as ComponentProps<typeof Animated.View>['style'];
    }, [enter, progress]);

    const resolvedRoot = useStyled({ root: style }) as { root?: ViewStyle };

    if (!mounted) return null;

    return (
      <StyledView
        ref={ref}
        testID={testID}
        pointerEvents={backdrop ? 'auto' : 'box-none'}
        accessibilityViewIsModal={modal}
        styled={{
          style: [
            StyleSheet.absoluteFill,
            { zIndex, minHeight: viewportHeight },
            alignStyles[align],
            resolvedRoot.root,
          ],
        }}
      >
        {backdrop ? (
          <Backdrop
            progress={progress}
            color={tones.backdrop}
            styled={styleBackdrop}
            onPress={dismissOnBackdrop ? onDismiss : undefined}
            testID={testID ? `${testID}-backdrop` : undefined}
          />
        ) : null}
        <Animated.View
          pointerEvents="box-none"
          style={[alignContent[align], contentStyle]}
        >
          {children}
        </Animated.View>
      </StyledView>
    );
  },
);
OverlayRoot.displayName = 'OverlayRoot';

const alignStyles: Record<OverlayAlign, ViewStyle> = {
  center: { justifyContent: 'center', alignItems: 'center' },
  bottom: { justifyContent: 'flex-end', alignItems: 'stretch' },
  top: { justifyContent: 'flex-start', alignItems: 'stretch' },
};

// Edge-aligned content fills the layer and sits at its edge, so a percent
// height on the content (BottomSheet's `maxHeight: '80%'`) resolves against
// the layer. Sized to its content instead, the wrapper made the sheet cap
// itself at 80% of its OWN height — shrunk, lifted off the bottom edge, with
// the scrim showing underneath. `box-none` keeps the empty part tappable.
const alignContent: Record<OverlayAlign, ViewStyle> = {
  center: { width: '100%', alignItems: 'center', padding: 24 },
  bottom: { width: '100%', flex: 1, justifyContent: 'flex-end' },
  top: { width: '100%', flex: 1, justifyContent: 'flex-start' },
};

export default OverlayRoot;
