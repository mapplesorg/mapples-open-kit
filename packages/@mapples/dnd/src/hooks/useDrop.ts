import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { LayoutRectangle, useWindowDimensions, View } from 'react-native';
import { filter } from 'rxjs';

import { DnDEventType, DropTarget, DropTargetConfig } from '../types';
import { filterEvents } from '../utils';

import useDnD from './useDnD';
import useDropContext from './useDropContext';

/**
 * Hook that makes a view a drop target within the drag and drop system.
 * This hook registers the view as a drop target and tracks drop state.
 *
 * @template DragData - The type of data being dragged
 * @template DropData - The type of data for drop targets (defaults to DragData)
 * @param ref - Reference to the view element that should be a drop target
 * @param config - Optional configuration for the drop target behavior
 * @param data - Optional data associated with this drop target
 * @returns Object containing drop state and utilities
 * @public
 */
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

  /**
   * Updates the layout information for the drop element.
   * This function should be called when the element's position or size changes.
   */
  const updateLayout = useCallback(() => {
    ref.current?.measureInWindow?.((x, y, width, height) => {
      layoutRef.current = { x, y, width, height };

      if (idRef.current) {
        monitor.updateDropElement(idRef.current, layoutRef.current);
      }
    });
  }, [monitor, ref]);

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
    /** The unique ID of the drop element */
    id,
    /** Whether a drag is currently over this drop target */
    isOver,
    /** The current drop target information */
    dropTarget,
    /** The index position within the drop target */
    dropTargetIndex,
    /** Whether any drag operation is currently active */
    isDragging,
    /** Function to update the element's layout information */
    updateLayout,
  };
};

export default useDrop;
