import { useEffect, useMemo, useState } from 'react';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
  PointerType,
} from 'react-native-gesture-handler';
import { TapGestureHandlerEventPayload } from 'react-native-gesture-handler/lib/typescript/handlers/GestureHandlerEventPayload';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { filter } from 'rxjs';

import { initialDragCoords, initialOverLayout } from '../constants';
import { DnDContextProvider } from '../context';
import { Monitor } from '../monitor';
import { DnDEventType, DnDRootViewProps } from '../types';
import { filterEvents } from '../utils';

/**
 * Root component that provides drag and drop functionality to its children.
 * This component sets up the gesture handling, context, and monitor for the entire drag and drop system.
 *
 * @template T - The type of data being dragged
 * @param props - The component props
 * @param props.children - The child elements rendered inside the gesture-enabled root view
 * @param props.DragElement - Optional custom renderer for the drag overlay element
 * @param props.onDrop - Callback fired when a drag operation completes over a valid drop target
 * @returns The rendered drag and drop root view
 * @public
 */
const DnDRootView = <T extends object>({
  children,
  DragElement,
  onDrop,
  pointerTransform,
  ...props
}: DnDRootViewProps<T>) => {
  const [isDragging, setIsDragging] = useState(false);
  // Lazy state init creates the Monitor exactly once and keeps the same
  // instance for the component's lifetime, without reading refs during render
  // or re-creating it on every render. We never call the setter, so this never
  // triggers a re-render.
  const [monitor] = useState(() => new Monitor<T>({ padding: 5 }));

  const sv = useSharedValue(initialDragCoords);
  const svOverLayout = useSharedValue(initialOverLayout);
  // Window position of the pointer at touch-down (onBegin). onStart only
  // fires after minDistance, and translationX/Y is measured from ACTIVATION,
  // so the activation event alone cannot recover where the press began.
  const pressSV = useSharedValue(initialDragCoords);

  useEffect(() => {
    const subscription = monitor.events
      .pipe(filter(filterEvents(DnDEventType.DragStart, DnDEventType.DragEnd)))
      .subscribe((e) => {
        if (e.type === DnDEventType.DragStart) {
          setIsDragging(true);
          return;
        }

        if (e.type === DnDEventType.DragEnd) {
          setIsDragging(false);
          if (onDrop) {
            // Released outside every drop area — the drag is over, but there
            // is nothing to drop onto.
            if (e.cancelled || !e.dropTarget) return;
            if (!e.target) return;
            const target = monitor.getDragTargetData(e.target);
            if (!target) return;
            onDrop(e, target.item);
          }
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [monitor, onDrop]);

  /**
   * Handles pan gesture events for drag operations.
   * @param type - The type of pan event (start, end, or drag)
   * @param e - The gesture event payload
   */
  const handlePanEvents = (
    type: 'onDragStart' | 'onDragEnd' | 'onDrag',
    e:
      | GestureStateChangeEvent<PanGestureHandlerEventPayload>
      | GestureUpdateEvent<PanGestureHandlerEventPayload>,
    pressWindow?: { x: number; y: number },
  ) => {
    const windowCoords = { x: e.absoluteX, y: e.absoluteY };
    const coords = pointerTransform
      ? pointerTransform(windowCoords)
      : windowCoords;

    if (type === 'onDragStart') {
      // Hit-test at the TOUCH-DOWN point (captured in onBegin), not the
      // activation point. onStart fires only after minDistance, and a fast
      // drag can be far past the pressed element by then — hit-testing there
      // grabbed whatever was under the pointer mid-path (e.g. an element in
      // another frame) instead of what the user pressed.
      const startWindow = pressWindow ?? windowCoords;
      // Drag sources (palette items) are window-space; drop targets may be
      // in a transformed space — the monitor needs both. A null transform is
      // the normal case for a palette press (the palette sits beside the drop
      // space, not on it), so the drag still starts off the window coords.
      monitor.onDragStart(
        pointerTransform ? pointerTransform(startWindow) : startWindow,
        startWindow,
      );
      return;
    }

    if (type === 'onDrag') {
      // A null transform means the pointer is off the drop space entirely.
      if (!coords) {
        monitor.onDragOutside();
        return;
      }

      monitor.onDrag(coords);
      return;
    }

    // Release: a pointer-up outside the drop space needs no preceding move
    // to count as a cancel.
    if (!coords) monitor.onDragOutside();
    monitor.onDragEnd();
  };

  /**
   * Handles tap gesture events for selection.
   * @param e - The tap gesture event payload
   */
  const handleSelect = (
    e: GestureStateChangeEvent<TapGestureHandlerEventPayload>,
  ) => {
    const windowCoords = { x: e.absoluteX, y: e.absoluteY };
    const coords = pointerTransform
      ? pointerTransform(windowCoords)
      : windowCoords;

    // Tapped outside the drop space (surrounding chrome) — not a selection
    // gesture at all, so it must not hit-test into the space.
    if (!coords) return;

    monitor.onSelect(coords);
  };

  const tap = Gesture.Tap().onEnd((e) => {
    // Gesture-handler's web KeyboardEventManager treats Enter/Space as
    // "activation keys": a keydown bubbling from any focused element inside
    // this root begins a synthetic press and the keyup completes it — a
    // phantom tap at the element's center. For a focused text field that
    // meant pressing space selected whatever lay under the field (ending an
    // in-place edit mid-word). Selection is a pointer concept here, so
    // keyboard-synthesized taps are ignored outright.
    if (e.pointerType === PointerType.KEY) return;
    runOnJS(handleSelect)(e);
  });

  const pan = Gesture.Pan()
    // A few pixels of slack so taps never register as element move-drags.
    .minDistance(4)
    .onBegin((e) => {
      pressSV.set({ x: e.absoluteX, y: e.absoluteY });
    })
    .onStart((e) => {
      sv.set({
        x: e.x,
        y: e.y,
      });
      runOnJS(handlePanEvents)('onDragStart', e, pressSV.get());
    })
    .onChange((e) => {
      sv.set({
        x: e.x,
        y: e.y,
      });
      runOnJS(handlePanEvents)('onDrag', e);
    })
    .onEnd((e) => {
      sv.set(initialDragCoords);
      runOnJS(handlePanEvents)('onDragEnd', e);
    })
    // A gesture cancelled rather than ended (pointer released off-window, or
    // the race lost after activation) never reaches onEnd, which used to
    // strand the drag ghost and highlights on screen. The monitor's onDragEnd
    // is idempotent, so the normal end → finalize pair is a no-op the second
    // time round.
    .onFinalize((e) => {
      sv.set(initialDragCoords);
      runOnJS(handlePanEvents)('onDragEnd', e);
    });

  const composed = Gesture.Race(pan, tap);

  // Every useDnD consumer (one per rendered node) re-renders when this value
  // changes identity — keep it stable across unrelated root re-renders.
  const contextValue = useMemo(
    () => ({
      monitor,
      isDragging,
      sv,
      svOverLayout,
    }),
    [monitor, isDragging, sv, svOverLayout],
  );

  return (
    <DnDContextProvider value={contextValue}>
      <GestureHandlerRootView {...props}>
        <GestureDetector gesture={composed}>{children}</GestureDetector>
      </GestureHandlerRootView>
    </DnDContextProvider>
  );
};

export default DnDRootView;
