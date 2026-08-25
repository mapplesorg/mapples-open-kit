import { last, sortBy } from 'lodash';
import { LayoutRectangle } from 'react-native';
import { Subject } from 'rxjs';

import {
  DnDEvent,
  DnDEventType,
  DragCoords,
  DragElementTarget,
  DragItem,
  DropItem,
  DropTarget,
  DropTargetConfig,
  DropTree,
  FlexDirection,
  FrameEntry,
  MonitorConfig,
  MoveDragSource,
} from '../types';

/**
 * Core monitor class that manages drag and drop operations.
 * This class tracks drag elements, drop targets, handles hit detection, and emits events.
 *
 * @template DragData - The type of data being dragged
 * @template DropData - The type of data for drop targets (defaults to DragData)
 * @public
 */
export class Monitor<
  DragData extends object,
  DropData extends object = DragData,
> {
  /** Observable stream of drag and drop events */
  events = new Subject<DnDEvent<DragData, DropData>>();

  /** Padding around drop targets for hit detection */
  private readonly padding: number = 0;

  /** Counter for generating unique drag element IDs */
  private dragElementIds = 0;
  /** Counter for generating unique drop element IDs */
  private dropElementIds = 0;

  /** Map of registered drag elements by ID */
  private dragElements = new Map<number, DragElementTarget<DragData>>();
  /** Tree structure of registered drop elements */
  private dropElementsTree: DropTree<DropData> = new Map();
  /** Registered frame coordinate spaces by key */
  private frames = new Map<string, FrameEntry>();

  /** ID of the currently active drag target */
  private dragTargetId: number | null = null;
  /** Active move-drag source (an existing canvas element being moved) */
  private moveSource: MoveDragSource | null = null;
  /** Pointer coords at drag start / most recent drag tick (drop space) */
  private dragStartCoords: DragCoords | null = null;
  private lastDragCoords: DragCoords | null = null;
  /** Currently active drop target */
  private dropTarget: DropTarget<DropData> | null = null;

  /** Index position within the current drop target */
  private dropTargetIndex: number | null = null;
  /** Whether to track drag operations outside the root element */
  private trackOutside: boolean = false;

  /**
   * Creates a new Monitor instance.
   * @param config - Configuration options for the monitor
   */
  constructor(config: MonitorConfig) {
    this.padding = config?.padding;
    if (config.trackOutside) {
      this.trackOutside = true;
    }
  }

  /**
   * Registers (or replaces) a frame coordinate space. Drop elements whose
   * config carries the same `frameKey` are stored and hit-tested in
   * coordinates relative to this frame's origin.
   */
  registerFrame(frameKey: string, entry: FrameEntry) {
    this.frames.set(frameKey, entry);
  }

  /**
   * Moves a frame's world origin. O(1): no element re-measures needed since
   * frame content layouts are origin-relative.
   */
  updateFrameOrigin(frameKey: string, origin: DragCoords) {
    const frame = this.frames.get(frameKey);
    if (!frame) return;
    this.frames.set(frameKey, { ...frame, origin });
  }

  /** Removes a frame coordinate space. */
  unregisterFrame(frameKey: string) {
    this.frames.delete(frameKey);
  }

  /** Gets a registered frame space by key. */
  getFrame(frameKey: string) {
    return this.frames.get(frameKey);
  }

  /**
   * Converts world coordinates into a frame's local space.
   * Falls through unchanged when the frame isn't registered.
   */
  toFrameLocal(coords: DragCoords, frameKey: string): DragCoords {
    const frame = this.frames.get(frameKey);
    if (!frame) return coords;

    return { x: coords.x - frame.origin.x, y: coords.y - frame.origin.y };
  }

  /**
   * Gets the ID of the currently active drag target.
   * @returns The drag target ID or null if no drag is active
   */
  getDragTargetId() {
    return this.dragTargetId;
  }

  /**
   * Sets the ID of the currently active drag target.
   * @param id - The drag target ID or null
   */
  private setDragTargetId(id: number | null) {
    this.dragTargetId = id;
  }

  /**
   * Triggers a force layout update event.
   * This causes all registered elements to recalculate their layout information.
   */
  triggerForceLayoutUpdate() {
    this.events.next({
      type: DnDEventType.LayoutForceUpdate,
    });
  }

  /**
   * Gets the currently active drop target.
   * @returns The drop target or null if no drop target is active
   */
  getDropTarget() {
    return this.dropTarget;
  }

  /**
   * Sets the currently active drop target.
   * @param target - The drop target or null
   */
  setDropTarget(target: DropTarget<DropData> | null) {
    this.dropTarget = target;
  }

  /**
   * Gets the drag target data for a specific ID.
   * @param id - The drag target ID
   * @returns The drag element target data or undefined if not found
   */
  getDragTargetData(id: number) {
    return this.dragElements.get(id);
  }

  /**
   * Sets the index position within the current drop target.
   * @param index - The index position or null
   */
  setDropTargetIndex(index: number | null) {
    this.dropTargetIndex = index;
  }

  /**
   * Gets the index position within the current drop target.
   * @returns The index position or null if no drop target is active
   */
  getDropTargetIndex() {
    return this.dropTargetIndex;
  }

  /**
   * Registers a new drag element with the monitor.
   * @param layout - The layout rectangle of the drag element
   * @param item - The drag item configuration
   * @returns The unique ID assigned to the drag element
   */
  registerDragElement(layout: LayoutRectangle, item: DragItem<DragData>) {
    this.dragElementIds++;
    this.dragElements.set(this.dragElementIds, { ...layout, item });
    return this.dragElementIds;
  }

  /**
   * Unregisters a drag element from the monitor.
   * @param id - The ID of the drag element to unregister
   */
  unregisterDragElement(id: number) {
    this.dragElements.delete(id);
  }

  /**
   * Updates the layout and item data for a registered drag element.
   * @param id - The ID of the drag element
   * @param layout - The new layout rectangle
   * @param item - The new drag item configuration
   */
  updateDragElement(
    id: number,
    layout: LayoutRectangle,
    item: DragItem<DragData>,
  ) {
    const element = this.dragElements.get(id);
    if (!element) {
      return;
    }

    this.dragElements.set(id, { ...layout, item });
  }

  /**
   * Updates only the layout information for a registered drag element.
   * @param id - The ID of the drag element
   * @param layout - The new layout rectangle
   */
  updateDragElementLayout(id: number, layout: LayoutRectangle) {
    const element = this.dragElements.get(id);
    if (!element) {
      return;
    }

    this.dragElements.set(id, { ...layout, item: element.item });
  }

  /**
   * Handles the start of a drag operation.
   * @param dragCoords - Coordinates in drop-target space (world space when a
   * pointer transform is installed), or `null` when the press began outside
   * that space entirely. A palette press is exactly that case — the palette
   * lives beside the canvas, not on it — so a null here must never abort the
   * drag; it only rules out grabbing an existing element to move.
   * @param windowCoords - Raw window coordinates for drag-*source* hit
   * testing (palette items live outside any frame); defaults to `dragCoords`
   */
  onDragStart(dragCoords: DragCoords | null, windowCoords?: DragCoords) {
    this.dragStartCoords = dragCoords;
    this.lastDragCoords = dragCoords;

    const sourceCoords = windowCoords ?? dragCoords;
    if (!sourceCoords) return;

    const dragTargetId = this.getDragTarget(sourceCoords);

    if (dragTargetId) {
      const dragTarget = this.dragElements.get(dragTargetId);

      this.setDragTargetId(dragTargetId);

      this.events.next({
        type: DnDEventType.DragStart,
        target: this.getDragTargetId(),
        data: dragTarget?.item.data,
        kind: 'palette',
      });
      return;
    }

    // No palette source under the pointer — a drag that starts on an
    // existing canvas element moves it (Figma-style direct manipulation).
    // A press outside the drop space can't be on such an element.
    if (!dragCoords) return;

    const dropTargets = this.getDropTargets(dragCoords, this.dropElementsTree);
    const shallowTarget = this.getShallowTarget(dropTargets, dragCoords);
    const componentId = (shallowTarget?.data as { id?: string } | undefined)
      ?.id;

    if (!shallowTarget || !componentId) return;
    // Root-level elements (page roots) are not movable.
    if (this.dropElementsTree.has(shallowTarget.id)) return;

    const hit = shallowTarget.hitCoords ?? dragCoords;

    this.moveSource = {
      dropId: shallowTarget.id,
      componentId,
      frameKey: shallowTarget.frameKey ?? null,
      grabOffset: {
        x: hit.x - shallowTarget.layout.x,
        y: hit.y - shallowTarget.layout.y,
      },
    };

    this.events.next({
      type: DnDEventType.DragStart,
      dropTarget: shallowTarget,
      data: shallowTarget.data as unknown as DragData,
      kind: 'move',
      moveSource: this.moveSource,
      frameKey: shallowTarget.frameKey ?? null,
    });
  }

  /**
   * Handles drag movement during a drag operation.
   * @param dragCoords - The current coordinates of the drag
   */
  onDrag(dragCoords: DragCoords) {
    const dragTargetId = this.getDragTargetId();

    if (!dragTargetId && !this.moveSource) return;

    this.lastDragCoords = dragCoords;

    // While moving an element, its own subtree is not a valid drop target.
    const dropTargets = this.getDropTargets(
      dragCoords,
      this.dropElementsTree,
      null,
      this.moveSource?.dropId ?? null,
    );
    const shallowTarget = this.getShallowTarget(dropTargets, dragCoords);

    // Leaving every droppable area clears the pending drop rather than
    // keeping the last one: the pointer is the only thing that decides where
    // a drop lands, so hovering out must be indistinguishable from never
    // having hovered in. The Drag event still fires (with a null target) so
    // overlays drop their highlight instead of stranding it on the element
    // the pointer last passed over.
    const target = shallowTarget?.canDrop ? shallowTarget : null;

    this.setDropTarget(target);
    this.setDropTargetIndex(
      target
        ? this.getDropTargetIndexData(target.hitCoords ?? dragCoords, target)
        : null,
    );

    this.events.next({
      type: DnDEventType.Drag,
      target: dragTargetId,
      dropTarget: this.getDropTarget(),
      dropTargetIndex: this.getDropTargetIndex(),
      dragCoords: dragCoords,
      frameKey: target?.frameKey ?? null,
      kind: this.moveSource ? 'move' : 'palette',
      moveSource: this.moveSource,
    });
  }

  /**
   * The pointer left the drop coordinate space entirely — reported by the
   * host when its `pointerTransform` cannot place the pointer (e.g. it moved
   * off the canvas viewport onto surrounding chrome). Equivalent to hovering
   * empty space: the pending drop clears, so a release here cancels.
   */
  onDragOutside() {
    const dragTargetId = this.getDragTargetId();

    if (!dragTargetId && !this.moveSource) return;
    // Already cleared — don't republish on every pointer move outside.
    if (!this.getDropTarget() && this.getDropTargetIndex() === null) return;

    this.setDropTarget(null);
    this.setDropTargetIndex(null);

    this.events.next({
      type: DnDEventType.Drag,
      target: dragTargetId,
      dropTarget: null,
      dropTargetIndex: null,
      dragCoords: this.lastDragCoords,
      frameKey: null,
      kind: this.moveSource ? 'move' : 'palette',
      moveSource: this.moveSource,
    });
  }

  /**
   * Hit-tests a point in drop space with no drag registered. Drags that start
   * outside the app — files dragged in from the OS — never register a drag
   * element, so they cannot go through {@link onDrag}; this gives them the
   * same target and insert-index resolution the in-app drag path uses.
   * @param dropCoords - The coordinates to hit-test, in drop space
   */
  hitTest(dropCoords: DragCoords) {
    const dropTargets = this.getDropTargets(dropCoords, this.dropElementsTree);
    const shallowTarget = this.getShallowTarget(dropTargets, dropCoords);
    const dropTarget = shallowTarget?.canDrop ? shallowTarget : null;

    return {
      dropTarget,
      dropTargetIndex: dropTarget
        ? this.getDropTargetIndexData(
            dropTarget.hitCoords ?? dropCoords,
            dropTarget,
          )
        : null,
    };
  }

  /**
   * Publishes an external drag's current position, so the drop chrome
   * (hover highlight, insert line) tracks a file dragged in from the OS
   * exactly as it tracks an in-app drag. Pass `null` coordinates while the
   * pointer sits outside the drop space — that clears the pending drop the
   * same way hovering off a droppable area does mid-drag.
   * @param dropCoords - The pointer position in drop space, or null
   */
  onExternalDrag(dropCoords: DragCoords | null) {
    const { dropTarget, dropTargetIndex } = dropCoords
      ? this.hitTest(dropCoords)
      : { dropTarget: null, dropTargetIndex: null };

    // Nothing to say when the drag is still over empty space it was already
    // over — pointer moves arrive at input rate.
    if (!dropTarget && !this.getDropTarget()) return;

    this.lastDragCoords = dropCoords;
    this.setDropTarget(dropTarget);
    this.setDropTargetIndex(dropTargetIndex);

    this.events.next({
      type: DnDEventType.Drag,
      target: null,
      dropTarget,
      dropTargetIndex,
      dragCoords: dropCoords,
      frameKey: dropTarget?.frameKey ?? null,
      kind: 'external',
    });
  }

  /**
   * Ends an external drag — the files were dropped, or the drag left the
   * window. Always `cancelled`: whatever the drop produces is inserted by
   * the host once its uploads finish, never by the DnD path.
   */
  onExternalDragEnd() {
    this.lastDragCoords = null;
    this.setDropTarget(null);
    this.setDropTargetIndex(null);

    this.events.next({
      type: DnDEventType.DragEnd,
      target: null,
      dropTarget: null,
      dropTargetIndex: null,
      frameKey: null,
      kind: 'external',
      cancelled: true,
    });
  }

  /**
   * Handles selection/tap events.
   * @param dragCoords - The coordinates where the selection occurred
   */
  onSelect(dragCoords: DragCoords) {
    if (!this.isInsideAnyRootElement(dragCoords) && !this.trackOutside) return;

    const dropTargets = this.getDropTargets(dragCoords, this.dropElementsTree);
    const shallowTarget = this.getShallowTarget(dropTargets, dragCoords);

    this.events.next({
      type: DnDEventType.Select,
      dropTarget: shallowTarget,
      frameKey: shallowTarget?.frameKey ?? null,
    });
  }

  /**
   * Checks if the given coordinates are inside any root drop element,
   * converting into frame-local space for frame-rooted elements.
   * @private
   */
  private isInsideAnyRootElement(dragCoords: DragCoords): boolean {
    for (const [, target] of this.dropElementsTree) {
      const coords = target.frameKey
        ? this.toFrameLocal(dragCoords, target.frameKey)
        : dragCoords;

      if (
        target.layout.x <= coords.x &&
        target.layout.y <= coords.y &&
        target.layout.x + target.layout.width >= coords.x &&
        target.layout.y + target.layout.height >= coords.y
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Looks up a registered drop target (with its current layout and frame
   * key) by matching data properties — e.g. `{ id: componentId }`.
   *
   * @param frameKey - Restrict the search to one frame's subtree. Required
   * whenever ids are only unique per frame (every page root shares the id
   * `root`, so an unscoped lookup can return another frame's element).
   */
  getDropTargetByData(dataQuery: Partial<DropData>, frameKey?: string) {
    return this.findDropTargetByData(
      dataQuery,
      this.dropElementsTree,
      null,
      frameKey ?? null,
    );
  }

  /**
   * Handles external selection by data query.
   * @param dataQuery - Partial data to match against drop targets
   */
  onExternalSelect(dataQuery: Partial<DropData>) {
    const dropTarget = this.findDropTargetByData(
      dataQuery,
      this.dropElementsTree,
    );

    this.events.next({
      type: DnDEventType.Select,
      dropTarget: dropTarget,
      frameKey: dropTarget?.frameKey ?? null,
    });
  }

  /**
   * Handles the end of a drag operation. Releasing the pointer outside every
   * droppable area cancels the drag: `DragEnd` still fires — overlays, the
   * drag ghost and `isDragging` all reset on it — but carries a null
   * `dropTarget` and `cancelled: true`, so nothing is inserted or moved.
   */
  onDragEnd() {
    const dragTargetId = this.getDragTargetId();
    const moveSource = this.moveSource;
    const dropTarget = this.getDropTarget();

    // Idempotent: a pan that never became a drag (canvas panning, or a
    // gesture cancelled before activation) must not emit a phantom DragEnd.
    if (!dragTargetId && !moveSource) {
      this.resetDragState();
      return;
    }

    this.events.next({
      type: DnDEventType.DragEnd,
      target: dragTargetId,
      dropTarget: dropTarget,
      dropTargetIndex: dropTarget ? this.getDropTargetIndex() : null,
      frameKey: dropTarget?.frameKey ?? null,
      kind: moveSource ? 'move' : 'palette',
      moveSource,
      dragCoords: this.lastDragCoords,
      dragStartCoords: this.dragStartCoords,
      cancelled: !dropTarget,
    });

    this.resetDragState();
  }

  /**
   * Clears every piece of per-drag state.
   * @private
   */
  private resetDragState() {
    this.moveSource = null;
    this.dragStartCoords = null;
    this.lastDragCoords = null;
    this.setDragTargetId(null);
    this.setDropTarget(null);
    this.setDropTargetIndex(null);
  }

  /**
   * Registers a new drop element with the monitor.
   * @param layout - The layout rectangle of the drop element
   * @param parent - The ID of the parent drop element, or null for root level
   * @param config - Optional configuration for the drop target
   * @param data - Optional data associated with the drop target
   * @returns The unique ID assigned to the drop element
   */
  registerDropElement(
    layout: LayoutRectangle,
    parent: number | null,
    config?: DropTargetConfig,
    data?: DropData,
  ): number {
    this.dropElementIds++;

    if (!parent) {
      this.dropElementsTree.set(this.dropElementIds, {
        layout: {
          ...layout,
          index: config?.index || 0,
          zIndex: config?.zIndex || 0,
          flexDirection: config?.flexDirection || FlexDirection.Column,
        },
        canDrop: config?.canDrop,
        data,
        frameKey: config?.frameKey,
      });
    } else {
      const parentLayout = this.findDropTarget(parent, this.dropElementsTree);
      if (!parentLayout) {
        throw new Error('Parent element not found');
      }

      if (!parentLayout.children) {
        parentLayout.children = new Map();
      }

      parentLayout.children.set(this.dropElementIds, {
        layout: {
          ...layout,
          index: config?.index || 0,
          zIndex:
            config?.zIndex || parentLayout.layout.zIndex + this.dropElementIds,
          flexDirection: config?.flexDirection || FlexDirection.Column,
        },
        canDrop: config?.canDrop,
        data,
      });
    }

    return this.dropElementIds;
  }

  /**
   * Unregisters a drop element from the monitor.
   * @param id - The ID of the drop element to unregister
   */
  unregisterDropElement(id: number) {
    if (this.dropElementsTree.has(id)) {
      this.dropElementsTree.delete(id);
    }

    const parent = this.findDropTargetParent(id, this.dropElementsTree);
    parent?.children?.delete(id);
  }

  /**
   * Updates the layout and configuration for a registered drop element.
   * @param id - The ID of the drop element
   * @param layout - The new layout rectangle
   * @param config - Optional new configuration
   * @param data - Optional new data
   */
  updateDropElement(
    id: number,
    layout: LayoutRectangle,
    config?: DropTargetConfig,
    data?: DropData,
  ) {
    const target = this.findDropTarget(id, this.dropElementsTree);

    if (target) {
      target.layout.x = layout.x;
      target.layout.y = layout.y;
      target.layout.width = layout.width;
      target.layout.height = layout.height;
      target.layout.index = config?.index || target.layout.index;
      target.layout.zIndex = config?.zIndex || target.layout.zIndex;
      target.layout.flexDirection =
        config?.flexDirection || target.layout.flexDirection;
      target.data = data || target.data;
      target.canDrop = config?.canDrop || target.canDrop;

      if (this.dropElementsTree.has(id)) {
        this.dropElementsTree.set(id, target);
      } else {
        const parent = this.findDropTargetParent(id, this.dropElementsTree);
        if (parent) {
          parent.children?.set(id, target);
        }
      }

      const frameKey = this.findFrameKeyFor(id, this.dropElementsTree, null);

      this.events.next({
        type: DnDEventType.Layout,
        target: id,
        dropTarget: {
          id,
          index: target.layout.index,
          layout: target.layout,
          canDrop: target.canDrop,
          data: target.data,
          frameKey,
        },
        frameKey,
      });
    }
  }

  /**
   * Resolves the frame space an element (or any of its ancestors) belongs to.
   * @private
   */
  private findFrameKeyFor(
    id: number,
    tree: DropTree<DropData> | undefined,
    inherited: string | null,
  ): string | null {
    if (!tree) return null;

    for (const [key, value] of tree) {
      const frameKey = value.frameKey ?? inherited;

      if (key === id) {
        return frameKey;
      }

      const childResult = this.findFrameKeyFor(id, value.children, frameKey);
      if (childResult !== null) {
        return childResult;
      }
    }

    return null;
  }

  /**
   * Finds a drop target by ID in the tree structure.
   * @param id - The ID to search for
   * @param tree - The tree to search in
   * @returns The drop item or null if not found
   * @private
   */
  private findDropTarget(
    id: number,
    tree?: DropTree<DropData>,
  ): DropItem<DropData> | null {
    if (!tree) {
      return null;
    }

    if (tree.has(id)) {
      return tree.get(id) || null;
    }

    for (const [, value] of tree) {
      if (value.children) {
        const target = this.findDropTarget(id, value.children);
        if (target) {
          return target;
        }
      }
    }

    return null;
  }

  /**
   * Finds a drop target by matching data properties.
   * @param dataQuery - Partial data to match against
   * @param tree - The tree to search in
   * @returns The drop target or null if not found
   * @private
   */
  private findDropTargetByData(
    dataQuery: Partial<DropData>,
    tree?: DropTree<DropData>,
    frameKey?: string | null,
    requiredFrameKey?: string | null,
  ): DropTarget<DropData> | null {
    if (!tree) {
      return null;
    }

    let index = 0;
    for (const [id, target] of tree) {
      index++;
      const targetFrameKey = target.frameKey ?? frameKey ?? null;

      // Prune subtrees belonging to other frames when a frame is required.
      if (
        requiredFrameKey &&
        targetFrameKey &&
        targetFrameKey !== requiredFrameKey
      ) {
        continue;
      }

      if (
        target.data &&
        this.partialMatch(target.data, dataQuery) &&
        (!requiredFrameKey || targetFrameKey === requiredFrameKey)
      ) {
        return {
          id,
          layout: target.layout,
          index,
          canDrop: target.canDrop,
          children: target.children,
          data: target.data,
          frameKey: targetFrameKey,
        };
      }

      if (target.children) {
        const childResult = this.findDropTargetByData(
          dataQuery,
          target.children,
          targetFrameKey,
          requiredFrameKey,
        );
        if (childResult) {
          return childResult;
        }
      }
    }

    return null;
  }

  /**
   * Performs a partial match between target data and query data.
   * @param targetData - The target data to match against
   * @param query - The query data to match
   * @returns True if the query matches the target data
   * @private
   */
  private partialMatch(targetData: any, query: any): boolean {
    if (query === targetData) {
      return true;
    }

    if (query == null || targetData == null) {
      return false;
    }

    if (typeof query !== 'object' || typeof targetData !== 'object') {
      return false;
    }

    // Check if all properties in query exist and match in targetData
    const queryKeys = Object.keys(query);

    for (const key of queryKeys) {
      if (!(key in targetData)) {
        return false;
      }

      // Recursively check nested objects
      if (typeof query[key] === 'object' && query[key] != null) {
        if (!this.partialMatch(targetData[key], query[key])) {
          return false;
        }
      } else if (targetData[key] !== query[key]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Finds the parent of a drop target by ID.
   * @param id - The ID of the child drop target
   * @param tree - The tree to search in
   * @returns The parent drop item or null if not found
   * @private
   */
  private findDropTargetParent(
    id: number,
    tree?: DropTree<DropData>,
  ): DropItem<DropData> | null {
    if (!tree) {
      return null;
    }

    for (const [, value] of tree) {
      if (value.children && value.children.has(id)) {
        return value;
      } else {
        const parent = this.findDropTargetParent(id, value.children);
        if (parent) {
          return parent;
        }
      }
    }

    return null;
  }

  /**
   * Gets all drop targets that contain the given coordinates.
   * @param dropCoords - The coordinates to check
   * @param tree - The tree to search in
   * @returns Array of drop targets or null if none found
   * @private
   */
  private getDropTargets(
    dropCoords: DragCoords,
    tree?: DropTree<DropData>,
    frameKey?: string | null,
    excludeId?: number | null,
  ) {
    const targets: DropTarget<DropData>[] = [];

    if (!tree) {
      return null;
    }

    let index = 0;
    for (const [id, target] of tree) {
      index++;

      // Skip the excluded subtree entirely (a moved element can't be its
      // own drop target, nor can any of its descendants).
      if (excludeId != null && id === excludeId) {
        continue;
      }

      // Entering a frame-rooted subtree: convert the pointer into that
      // frame's local space once; all descendant layouts share it.
      const targetFrameKey = target.frameKey ?? frameKey ?? null;
      const coords = target.frameKey
        ? this.toFrameLocal(dropCoords, target.frameKey)
        : dropCoords;

      if (
        target.layout.x <= coords.x &&
        target.layout.y <= coords.y &&
        target.layout.x + target.layout.width >= coords.x &&
        target.layout.y + target.layout.height >= coords.y
      ) {
        targets.push({
          id,
          layout: target.layout,
          index,
          canDrop: target.canDrop,
          children: target.children,
          data: target.data,
          frameKey: targetFrameKey,
          hitCoords: coords,
        });
      }

      const childTargets = this.getDropTargets(
        coords,
        target.children,
        targetFrameKey,
        excludeId,
      );

      if (childTargets) {
        targets.push(...childTargets);
      }
    }

    return targets;
  }

  /**
   * Gets the shallowest (topmost) drop target from a list of targets.
   * @param targets - Array of drop targets
   * @param dragCoords - The current drag coordinates
   * @returns The shallowest drop target or null
   * @private
   */
  private getShallowTarget(
    targets: DropTarget<DropData>[] | null,
    dragCoords: DragCoords,
  ) {
    if (!targets) {
      return null;
    }

    const sortedTargets = sortBy(targets, 'layout.zIndex');
    const lastTarget = last(sortedTargets);

    if (!lastTarget) {
      return null;
    }

    // Compare in the target's own coordinate space (frame-local inside
    // frames); `hitCoords` was attached during hit testing.
    const coords = lastTarget.hitCoords ?? dragCoords;

    if (
      lastTarget.layout.y + this.padding > coords.y ||
      lastTarget.layout.y + lastTarget.layout.height - this.padding <
        coords.y ||
      lastTarget.layout.x + this.padding > coords.x ||
      lastTarget.layout.x + lastTarget.layout.width - this.padding < coords.x
    ) {
      return sortedTargets[sortedTargets.length - 2] || lastTarget;
    }

    return lastTarget;
  }

  /**
   * Calculates the drop target index based on drag coordinates and target layout.
   * @param dragCoords - The current drag coordinates
   * @param target - The drop target to calculate index for
   * @returns The calculated index or null
   * @private
   */
  private getDropTargetIndexData(
    dragCoords: DragCoords,
    target: DropTarget<DropData> | null,
  ): number | null {
    if (!target || !target.children) return null;

    let nearestId: number | null = null;

    let nearestDistance = Infinity;

    for (const [id, child] of target.children) {
      const centerX = child.layout.x + child.layout.width / 2;
      const centerY = child.layout.y + child.layout.height / 2;

      const distance = Math.sqrt(
        Math.pow(centerX - dragCoords.x, 2) +
          Math.pow(centerY - dragCoords.y, 2),
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestId = id;
      }
    }

    if (!nearestId) return null;

    const nearestLayout = target.children.get(nearestId);

    if (!nearestLayout) return null;

    const nearestLayoutCenterX =
      nearestLayout.layout.x + nearestLayout.layout.width / 2;
    const nearestLayoutCenterY =
      nearestLayout.layout.y + nearestLayout.layout.height / 2;

    const [x, y] = [
      dragCoords.x - nearestLayoutCenterX,
      dragCoords.y - nearestLayoutCenterY,
    ];

    if (
      (target.layout.flexDirection === FlexDirection.Row && x > 0) ||
      (target.layout.flexDirection === FlexDirection.Column && y > 0)
    ) {
      return nearestLayout.layout.index + 1;
    }

    return nearestLayout.layout.index;
  }

  /**
   * Gets the drag target ID for the given coordinates.
   * @param dragCoords - The coordinates to check
   * @returns The drag target ID or null if none found
   * @private
   */
  private getDragTarget(dragCoords: DragCoords) {
    for (const [id, layout] of this.dragElements) {
      if (
        layout.x <= dragCoords.x &&
        layout.y <= dragCoords.y &&
        layout.x + layout.width >= dragCoords.x &&
        layout.y + layout.height >= dragCoords.y
      ) {
        return id;
      }
    }

    return null;
  }
}
