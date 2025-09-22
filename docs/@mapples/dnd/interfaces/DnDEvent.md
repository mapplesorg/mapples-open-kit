[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/dnd](../README.md) / DnDEvent

# Interface: DnDEvent\<DragData, DropData\>

Defined in: [types/index.ts:36](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L36)

Interface representing a drag and drop event with associated data.

## Type Parameters

### DragData

`DragData` *extends* `object`

The type of data being dragged

### DropData

`DropData` *extends* `object` = `DragData`

The type of data for drop targets (defaults to DragData)

## Properties

### type

> **type**: [`DnDEventType`](../enumerations/DnDEventType.md)

Defined in: [types/index.ts:41](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L41)

The type of drag and drop event

***

### target?

> `optional` **target**: `null` \| `number`

Defined in: [types/index.ts:43](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L43)

The ID of the drag target element

***

### dropTarget?

> `optional` **dropTarget**: `null` \| [`DropTarget`](DropTarget.md)\<`DropData`\>

Defined in: [types/index.ts:45](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L45)

The drop target that the drag is currently over

***

### dropTargetIndex?

> `optional` **dropTargetIndex**: `null` \| `number`

Defined in: [types/index.ts:47](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L47)

The index position within the drop target

***

### data?

> `optional` **data**: `null` \| `DragData`

Defined in: [types/index.ts:49](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L49)

The data associated with the drag operation

***

### dragCoords?

> `optional` **dragCoords**: `null` \| [`DragCoords`](../type-aliases/DragCoords.md)

Defined in: [types/index.ts:51](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L51)

The current coordinates of the drag operation
