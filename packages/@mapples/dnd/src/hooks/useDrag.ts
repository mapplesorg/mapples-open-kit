import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { LayoutRectangle, View } from 'react-native';
import { filter } from 'rxjs';

import { DnDEventType, DragItem } from '../types';

import useDnD from './useDnD';

/**
 * Hook that makes a view draggable within the drag and drop system.
 * This hook registers the view as a drag source and tracks its drag state.
 *
 * @template DragData - The type of data being dragged
 * @template DropData - The type of data for drop targets (defaults to DragData)
 * @param ref - Reference to the view element that should be draggable
 * @param item - The drag item configuration with data and metadata
 * @returns Object containing drag state and utilities
 * @public
 */
const useDrag = <DragData extends object, DropData extends object = DragData>(
  ref: RefObject<View | null>,
  item: DragItem<DragData>,
) => {
  const { monitor } = useDnD<DragData, DropData>();

  const [isDragging, setIsDragging] = useState(false);
  const [id, setId] = useState<number | null>(null);

  const idRef = useRef<number | null>(null);
  const layoutRef = useRef<LayoutRectangle | null>(null);
  const registrationGenerationRef = useRef(0);

  useEffect(() => {
    // measureInWindow resolves in a later task. A stale callback from a
    // superseded run (re-run or unmount) that still sees idRef.current ===
    // null would register a duplicate drag element nobody ever unregisters.
    // The generation token invalidates in-flight callbacks: bumped at the
    // start of every run and again in cleanup.
    const generation = ++registrationGenerationRef.current;

    ref.current?.measureInWindow?.((x, y, width, height) => {
      if (generation !== registrationGenerationRef.current) return;

      layoutRef.current = { x, y, width, height };

      if (idRef.current) {
        monitor.updateDragElement(idRef.current, layoutRef.current, item);
        return;
      }

      idRef.current = monitor.registerDragElement(layoutRef.current, item);
      setId(idRef.current);
    });

    return () => {
      registrationGenerationRef.current++;
    };
  }, [item, monitor, ref]);

  useEffect(() => {
    return () => {
      if (!idRef.current) return;

      monitor.unregisterDragElement(idRef.current);
    };
  }, [monitor]);

  /**
   * Updates the layout information for the drag element.
   * This function should be called when the element's position or size changes.
   */
  const updateLayout = useCallback(() => {
    ref.current?.measureInWindow?.((x, y, width, height) => {
      layoutRef.current = { x, y, width, height };
    });

    if (!idRef.current || !layoutRef.current) return;
    monitor.updateDragElementLayout(idRef.current, layoutRef.current);
  }, [monitor, ref]);

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
    /** The unique ID of the drag element */
    id,
    /** Function to update the element's layout information */
    updateLayout,
    /** Whether this element is currently being dragged */
    isDragging,
  };
};

export default useDrag;
