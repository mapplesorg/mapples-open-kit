import { useEffect, useRef, useState } from 'react';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { TapGestureHandlerEventPayload } from 'react-native-gesture-handler/lib/typescript/handlers/GestureHandlerEventPayload';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { filter } from 'rxjs';

import { initialDragCoords, initialOverLayout } from '../constants';
import { DnDContextProvider } from '../context';
import { Monitor } from '../monitor';
import { DnDEventType, DnDRootViewProps } from '../types';
import { filterEvents } from '../utils';

const DnDRootView = <T extends object>({
  children,
  DragElement,
  onDrop,
  ...props
}: DnDRootViewProps<T>) => {
  const [isDragging, setIsDragging] = useState(false);
  const monitor = useRef(new Monitor<T>({ padding: 5 })).current;

  const sv = useSharedValue(initialDragCoords);
  const svOverLayout = useSharedValue(initialOverLayout);

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

  const handlePanEvents = (
    type: 'onDragStart' | 'onDragEnd' | 'onDrag',
    e:
      | GestureStateChangeEvent<PanGestureHandlerEventPayload>
      | GestureUpdateEvent<PanGestureHandlerEventPayload>,
  ) => {
    monitor[type]({ x: e.absoluteX, y: e.absoluteY });
  };

  const handleSelect = (
    e: GestureStateChangeEvent<TapGestureHandlerEventPayload>,
  ) => {
    monitor.onSelect({ x: e.absoluteX, y: e.absoluteY });
  };

  const tap = Gesture.Tap().onEnd((e) => {
    runOnJS(handleSelect)(e);
  });

  const pan = Gesture.Pan()
    .onStart((e) => {
      sv.set({
        x: e.x,
        y: e.y,
      });
      runOnJS(handlePanEvents)('onDragStart', e);
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
    });

  const composed = Gesture.Race(pan, tap);

  return (
    <DnDContextProvider
      value={{
        monitor,
        isDragging,
        sv,
        svOverLayout,
      }}
    >
      <GestureHandlerRootView {...props}>
        <GestureDetector gesture={composed}>{children}</GestureDetector>
      </GestureHandlerRootView>
    </DnDContextProvider>
  );
};

export default DnDRootView;
