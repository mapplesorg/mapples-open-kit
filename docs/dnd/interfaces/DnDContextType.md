[**@mapples/dnd**](../README.md)

***

[@mapples/dnd](../globals.md) / DnDContextType

# Interface: DnDContextType\<DragData, DropData\>

Defined in: [types/index.ts:69](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L69)

Interface representing the drag and drop context type.

## Type Parameters

### DragData

`DragData` *extends* `object`

The type of data being dragged

### DropData

`DropData` *extends* `object` = `DragData`

The type of data for drop targets (defaults to DragData)

## Properties

### isDragging

> **isDragging**: `boolean`

Defined in: [types/index.ts:76](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L76)

Whether a drag operation is currently active

***

### monitor

> **monitor**: `Monitor`\<`DragData`, `DropData`\>

Defined in: [types/index.ts:74](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L74)

The monitor instance that tracks drag and drop operations

***

### sv

> **sv**: `SharedValue`\<[`DragCoords`](../type-aliases/DragCoords.md)\>

Defined in: [types/index.ts:78](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L78)

Shared value for drag coordinates

***

### svOverLayout

> **svOverLayout**: `SharedValue`\<`LayoutRectangle`\>

Defined in: [types/index.ts:80](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L80)

Shared value for overlay layout information
