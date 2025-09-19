import { RefObject, useEffect, useRef, useState } from 'react';

import { LayoutRectangle, View } from 'react-native';
import { filter } from 'rxjs';

import { DnDEventType, DragItem } from '../types';

import useDnD from './useDnD';

const useDrag = <DragData extends object, DropData extends object = DragData>(
  ref: RefObject<View | null>,
  item: DragItem<DragData>,
) => {
  const { monitor } = useDnD<DragData, DropData>();

  const [isDragging, setIsDragging] = useState(false);

  const idRef = useRef<number | null>(null);
  const layoutRef = useRef<LayoutRectangle | null>(null);

  useEffect(() => {
    ref.current?.measureInWindow?.((x, y, width, height) => {
      layoutRef.current = { x, y, width, height };

      if (idRef.current) {
        monitor.updateDragElement(idRef.current, layoutRef.current, item);
        return;
      }

      idRef.current = monitor.registerDragElement(layoutRef.current, item);
    });
  }, [item, monitor, ref]);

  useEffect(() => {
    return () => {
      if (!idRef.current) return;

      monitor.unregisterDragElement(idRef.current);
    };
  }, [monitor]);

  const updateLayout = useRef(() => {
    ref.current?.measureInWindow?.((x, y, width, height) => {
      layoutRef.current = { x, y, width, height };
    });

    if (!idRef.current || !layoutRef.current) return;
    monitor.updateDragElementLayout(idRef.current, layoutRef.current);
  }).current;

  useEffect(() => {
    const events = monitor.events
      .pipe(
        filter(
          (e) =>
            e.type === DnDEventType.DragStart ||
            e.type === DnDEventType.DragEnd,
        ),
      )
      .subscribe((e) => {
        if (e.type === DnDEventType.DragStart) {
          setIsDragging(e.target === idRef.current);
        } else {
          setIsDragging(false);
        }
      });

    return () => events.unsubscribe();
  }, [monitor.events]);

  return {
    id: idRef.current,
    updateLayout,
    isDragging,
  };
};

export default useDrag;
