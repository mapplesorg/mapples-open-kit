[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/dnd](../README.md) / DnDContextType

# Interface: DnDContextType\<DragData, DropData\>

Defined in: [types/index.ts:71](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L71)

Interface representing the drag and drop context type.

## Type Parameters

### DragData

`DragData` *extends* `object`

The type of data being dragged

### DropData

`DropData` *extends* `object` = `DragData`

The type of data for drop targets (defaults to DragData)

## Properties

### monitor

> **monitor**: [`Monitor`](../classes/Monitor.md)\<`DragData`, `DropData`\>

Defined in: [types/index.ts:76](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L76)

The monitor instance that tracks drag and drop operations

***

### isDragging

> **isDragging**: `boolean`

Defined in: [types/index.ts:78](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L78)

Whether a drag operation is currently active

***

### sv

> **sv**: `SharedValue`\<[`DragCoords`](../type-aliases/DragCoords.md)\>

Defined in: [types/index.ts:80](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L80)

Shared value for drag coordinates

***

### svOverLayout

> **svOverLayout**: `SharedValue`\<`LayoutRectangle`\>

Defined in: [types/index.ts:82](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L82)

Shared value for overlay layout information
