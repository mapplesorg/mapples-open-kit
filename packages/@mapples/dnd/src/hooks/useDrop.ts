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

import { DROP_PARENT_PENDING } from '../context/DropContext';
import { useFrameSpace } from '../context/FrameSpaceContext';
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
  const frameSpace = useFrameSpace();
  const { width, height } = useWindowDimensions();

  const [id, setId] = useState<number | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const idRef = useRef<number | null>(null);
  const layoutRef = useRef<LayoutRectangle | null>(null);

  /**
   * Measures the element in the active coordinate space. Inside a frame
   * space, rects are measured relative to the frame root (layout-engine
   * values — unaffected by viewport scale/translate on web), so they stay
   * valid across pan/zoom without re-measuring.
   */
  const measure = useCallback(
    (callback: (layout: LayoutRectangle) => void) => {
      const node = ref.current;
      if (!node) return;

      const frameRoot = frameSpace?.frameRootRef.current;

      if (frameRoot) {
        // measureLayout reads layout-engine offsets (transform-independent on
        // web); measuring the root against itself yields {0, 0, w, h}.
        node.measureLayout?.(frameRoot, (x, y, width, height) => {
          callback({ x, y, width, height });
        });
        return;
      }

      node.measureInWindow?.((x, y, width, height) => {
        callback({ x, y, width, height });
      });
    },
    [frameSpace, ref],
  );

  useLayoutEffect(() => {
    // Disabled — or the parent's own registration hasn't landed yet:
    // withdraw from the monitor entirely (no hit-testing, no drops) while
    // the component — and its subtree — stays mounted. Registering under a
    // pending parent would root the element in the wrong place, and parents
    // are fixed at registration time.
    if (config?.enabled === false || parent === DROP_PARENT_PENDING) {
      if (idRef.current) {
        monitor.unregisterDropElement(idRef.current);
        idRef.current = null;
        setId(null);
      }
      return;
    }

    measure((layout) => {
      layoutRef.current = layout;

      // Only the frame root (no drop parent) carries the frame key; children
      // inherit the space during hit testing.
      const effectiveConfig =
        frameSpace && !parent
          ? { ...config, frameKey: frameSpace.frameKey }
          : config;

      if (idRef.current) {
        monitor.updateDropElement(
          idRef.current,
          layoutRef.current!,
          effectiveConfig,
          data,
        );
        return;
      }

      idRef.current = monitor.registerDropElement(
        layoutRef.current!,
        parent,
        effectiveConfig,
        data,
      );
      setId(idRef.current);
    });
  }, [config, data, frameSpace, measure, monitor, parent, ref]);

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
    measure((layout) => {
      layoutRef.current = layout;

      if (idRef.current) {
        monitor.updateDropElement(idRef.current, layoutRef.current!);
      }
    });
  }, [measure, monitor]);

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
