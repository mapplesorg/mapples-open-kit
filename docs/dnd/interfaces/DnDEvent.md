[**@mapples/dnd**](../README.md)

***

[@mapples/dnd](../globals.md) / DnDEvent

# Interface: DnDEvent\<DragData, DropData\>

Defined in: [types/index.ts:34](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L34)

Interface representing a drag and drop event with associated data.

## Type Parameters

### DragData

`DragData` *extends* `object`

The type of data being dragged

### DropData

`DropData` *extends* `object` = `DragData`

The type of data for drop targets (defaults to DragData)

## Properties

### data?

> `optional` **data**: `null` \| `DragData`

Defined in: [types/index.ts:47](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L47)

The data associated with the drag operation

***

### dragCoords?

> `optional` **dragCoords**: `null` \| [`DragCoords`](../type-aliases/DragCoords.md)

Defined in: [types/index.ts:49](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L49)

The current coordinates of the drag operation

***

### dropTarget?

> `optional` **dropTarget**: `null` \| [`DropTarget`](DropTarget.md)\<`DropData`\>

Defined in: [types/index.ts:43](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L43)

The drop target that the drag is currently over

***

### dropTargetIndex?

> `optional` **dropTargetIndex**: `null` \| `number`

Defined in: [types/index.ts:45](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L45)

The index position within the drop target

***

### target?

> `optional` **target**: `null` \| `number`

Defined in: [types/index.ts:41](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L41)

The ID of the drag target element

***

### type

> **type**: [`DnDEventType`](../enumerations/DnDEventType.md)

Defined in: [types/index.ts:39](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L39)

The type of drag and drop event
