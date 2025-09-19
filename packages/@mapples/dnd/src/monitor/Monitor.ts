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

class Monitor<DragData extends object, DropData extends object = DragData> {
  events = new Subject<DnDEvent<DragData, DropData>>();

  private readonly padding: number = 0;

  private dragElementIds = 0;
  private dropElementIds = 0;

  private dragElements = new Map<number, DragElementTarget<DragData>>();
  private dropElementsTree: DropTree<DropData> = new Map();

  private dragTargetId: number | null = null;
  private dropTarget: DropTarget<DropData> | null = null;

  private dropTargetIndex: number | null = null;
  private trackOutside: boolean = false;

  constructor(config: MonitorConfig) {
    this.padding = config?.padding;
    if (config.trackOutside) {
      this.trackOutside = true;
    }
  }

  getDragTargetId() {
    return this.dragTargetId;
  }

  private setDragTargetId(id: number | null) {
    this.dragTargetId = id;
  }

  triggerForceLayoutUpdate() {
    this.events.next({
      type: DnDEventType.LayoutForceUpdate,
    });
  }

  getDropTarget() {
    return this.dropTarget;
  }

  setDropTarget(target: DropTarget<DropData> | null) {
    this.dropTarget = target;
  }

  getDragTargetData(id: number) {
    return this.dragElements.get(id);
  }

  setDropTargetIndex(index: number | null) {
    this.dropTargetIndex = index;
  }

  getDropTargetIndex() {
    return this.dropTargetIndex;
  }

  // drag monitor
  registerDragElement(layout: LayoutRectangle, item: DragItem<DragData>) {
    this.dragElementIds++;
    this.dragElements.set(this.dragElementIds, { ...layout, item });
    return this.dragElementIds;
  }

  unregisterDragElement(id: number) {
    this.dragElements.delete(id);
  }

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

  updateDragElementLayout(id: number, layout: LayoutRectangle) {
    const element = this.dragElements.get(id);
    if (!element) {
      return;
    }

    this.dragElements.set(id, { ...layout, item: element.item });
  }

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

  unregisterDropElement(id: number) {
    if (this.dropElementsTree.has(id)) {
      this.dropElementsTree.delete(id);
    }

    const parent = this.findDropTargetParent(id, this.dropElementsTree);
    parent?.children?.delete(id);
  }

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

export default Monitor;
