[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/dnd](../README.md) / useDrag

# Function: useDrag()

> **useDrag**\<`DragData`, `DropData`\>(`ref`, `item`): `object`

Defined in: [hooks/useDrag.ts:21](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/hooks/useDrag.ts#L21)

Hook that makes a view draggable within the drag and drop system.
This hook registers the view as a drag source and tracks its drag state.

## Type Parameters

### DragData

`DragData` *extends* `object`

The type of data being dragged

### DropData

`DropData` *extends* `object` = `DragData`

The type of data for drop targets (defaults to DragData)

## Parameters

### ref

`RefObject`\<`null` \| `View`\>

Reference to the view element that should be draggable

### item

[`DragItem`](../interfaces/DragItem.md)\<`DragData`\>

The drag item configuration with data and metadata

## Returns

Object containing drag state and utilities

### id

> **id**: `null` \| `number` = `idRef.current`

The unique ID of the drag element

### updateLayout()

> **updateLayout**: () => `void`

Function to update the element's layout information

#### Returns

`void`

### isDragging

> **isDragging**: `boolean`

Whether this element is currently being dragged
