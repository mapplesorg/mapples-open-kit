import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { LayoutRectangle, useWindowDimensions, View } from 'react-native';
import { filter } from 'rxjs';

import { DnDEventType, DropTarget, DropTargetConfig } from '../types';
import { filterEvents } from '../utils';

import useDnD from './useDnD';
import useDropContext from './useDropContext';

const useDrop = <DragData extends object, DropData extends object = DragData>(
  ref: RefObject<View | null>,
  config?: DropTargetConfig,
  data?: DropData,
) => {
  const [dropTarget, setDropTarget] = useState<DropTarget<DropData> | null>(
    null,
  );

  const { monitor, isDragging } = useDnD<DragData, DropData>();
  const { parent } = useDropContext();
  const { width, height } = useWindowDimensions();

  const [id, setId] = useState<number | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const idRef = useRef<number | null>(null);
  const layoutRef = useRef<LayoutRectangle | null>(null);

  useLayoutEffect(() => {
    ref.current?.measureInWindow?.((x, y, width, height) => {
      layoutRef.current = { x, y, width, height };

      if (idRef.current) {
        monitor.updateDropElement(
          idRef.current,
          layoutRef.current,
          config,
          data,
        );
        return;
      }

      idRef.current = monitor.registerDropElement(
        layoutRef.current,
        parent,
        config,
        data,
      );
      setId(idRef.current);
    });
  }, [config, data, monitor, parent, ref]);

  useEffect(() => {
    return () => {
      if (idRef.current) {
        monitor.unregisterDropElement(idRef.current);
      }
    };
  }, [monitor]);

  useEffect(() => {
    const subscription = monitor.events
      .pipe(filter(filterEvents(DnDEventType.Drag, DnDEventType.DragEnd)))
      .subscribe((e) => {
        if (e.type === DnDEventType.DragEnd) {
          setIsOver(false);
          setDropTarget(null);
          return;
        }
        setDropTarget(e.dropTarget || null);
        setIsOver(e.dropTarget?.id === idRef.current);
        setDropTargetIndex(e.dropTargetIndex || 0);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [monitor, monitor.events]);

  const updateLayout = useRef(() => {
    ref.current?.measureInWindow?.((x, y, width, height) => {
      layoutRef.current = { x, y, width, height };

      if (idRef.current) {
        monitor.updateDropElement(idRef.current, layoutRef.current);
      }
    });
  }).current;

  useEffect(() => {
    const subscription = monitor.events
      .pipe(filter(filterEvents(DnDEventType.LayoutForceUpdate)))
      .subscribe(() => {
        updateLayout();
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [monitor.events, updateLayout]);

  useEffect(() => {
    if (width || height) {
      updateLayout();
    }
  }, [width, height, updateLayout]);

  return {
    id,
    isOver,
    dropTarget,
    dropTargetIndex,
    isDragging,
    updateLayout,
  };
};

export default useDrop;
