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
  MonitorConfig,
} from '../types';

/**
 * Core monitor class that manages drag and drop operations.
 * This class tracks drag elements, drop targets, handles hit detection, and emits events.
 *
 * @template DragData - The type of data being dragged
 * @template DropData - The type of data for drop targets (defaults to DragData)
 * @public
 */
class Monitor<DragData extends object, DropData extends object = DragData> {
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

  /** ID of the currently active drag target */
  private dragTargetId: number | null = null;
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
   * @param dragCoords - The coordinates where the drag started
   */
  onDragStart(dragCoords: DragCoords) {
    const dragTargetId = this.getDragTarget(dragCoords);

    if (!dragTargetId) return;

    const dragTarget = this.dragElements.get(dragTargetId);

    this.setDragTargetId(dragTargetId);

    this.events.next({
      type: DnDEventType.DragStart,
      target: this.getDragTargetId(),
      data: dragTarget?.item.data,
    });
  }

  /**
   * Handles drag movement during a drag operation.
   * @param dragCoords - The current coordinates of the drag
   */
  onDrag(dragCoords: DragCoords) {
    const dragTargetId = this.getDragTargetId();

    if (!dragTargetId) return;

    const dropTargets = this.getDropTargets(dragCoords, this.dropElementsTree);
    const shallowTarget = this.getShallowTarget(dropTargets, dragCoords);

    if (!shallowTarget?.canDrop) return;

    this.setDropTarget(shallowTarget);

    const dropTargetIndex = this.getDropTargetIndexData(
      dragCoords,
      shallowTarget,
    );
    this.setDropTargetIndex(dropTargetIndex);

    this.events.next({
      type: DnDEventType.Drag,
      target: dragTargetId,
      dropTarget: this.getDropTarget(),
      dropTargetIndex: this.getDropTargetIndex(),
      dragCoords: dragCoords,
    });
  }

  /**
   * Handles selection/tap events.
   * @param dragCoords - The coordinates where the selection occurred
   */
  onSelect(dragCoords: DragCoords) {
    if (!this.isInsideFirstRootElement(dragCoords) && !this.trackOutside)
      return;

    const dropTargets = this.getDropTargets(dragCoords, this.dropElementsTree);
    const shallowTarget = this.getShallowTarget(dropTargets, dragCoords);

    this.events.next({
      type: DnDEventType.Select,
      dropTarget: shallowTarget,
    });
  }

  /**
   * Checks if the given coordinates are inside the first root element.
   * @param dragCoords - The coordinates to check
   * @returns True if inside the first root element
   * @private
   */
  private isInsideFirstRootElement(dragCoords: DragCoords): boolean {
    const firstRootElement = this.dropElementsTree.entries().next().value;
    if (!firstRootElement) return false;

    const [, firstRootTarget] = firstRootElement;

    return (
      firstRootTarget.layout.x <= dragCoords.x &&
      firstRootTarget.layout.y <= dragCoords.y &&
      firstRootTarget.layout.x + firstRootTarget.layout.width >= dragCoords.x &&
      firstRootTarget.layout.y + firstRootTarget.layout.height >= dragCoords.y
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
    });
  }

  /**
   * Handles the end of a drag operation.
   */
  onDragEnd() {
    const dropTarget = this.getDropTarget();

    if (!dropTarget) return;

    this.events.next({
      type: DnDEventType.DragEnd,
      target: this.getDragTargetId(),
      dropTarget: dropTarget,
      dropTargetIndex: this.getDropTargetIndex(),
    });

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

      this.events.next({
        type: DnDEventType.Layout,
        target: id,
        dropTarget: {
          id,
          index: target.layout.index,
          layout: target.layout,
          canDrop: target.canDrop,
          data: target.data,
        },
      });
    }
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
  ): DropTarget<DropData> | null {
    if (!tree) {
      return null;
    }

    let index = 0;
    for (const [id, target] of tree) {
      index++;

      if (target.data && this.partialMatch(target.data, dataQuery)) {
        return {
          id,
          layout: target.layout,
          index,
          canDrop: target.canDrop,
          children: target.children,
          data: target.data,
        };
      }

      if (target.children) {
        const childResult = this.findDropTargetByData(
          dataQuery,
          target.children,
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
  private getDropTargets(dropCoords: DragCoords, tree?: DropTree<DropData>) {
    const targets: DropTarget<DropData>[] = [];

    if (!tree) {
      return null;
    }

    let index = 0;
    for (const [id, target] of tree) {
      index++;
      if (
        target.layout.x <= dropCoords.x &&
        target.layout.y <= dropCoords.y &&
        target.layout.x + target.layout.width >= dropCoords.x &&
        target.layout.y + target.layout.height >= dropCoords.y
      ) {
        targets.push({
          id,
          layout: target.layout,
          index,
          canDrop: target.canDrop,
          children: target.children,
          data: target.data,
        });
      }

      const childTargets = this.getDropTargets(dropCoords, target.children);

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

    if (
      lastTarget.layout.y + this.padding > dragCoords.y ||
      lastTarget.layout.y + lastTarget.layout.height - this.padding <
        dragCoords.y ||
      lastTarget.layout.x + this.padding > dragCoords.x ||
      lastTarget.layout.x + lastTarget.layout.width - this.padding <
        dragCoords.x
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

export { Monitor };
export default Monitor;
