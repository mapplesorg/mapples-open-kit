[**@mapples/dnd**](../README.md)

***

[@mapples/dnd](../globals.md) / useDrag

# Function: useDrag()

> **useDrag**\<`DragData`, `DropData`\>(`ref`, `item`): `object`

Defined in: [hooks/useDrag.ts:21](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/hooks/useDrag.ts#L21)

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

### isDragging

> **isDragging**: `boolean`

Whether this element is currently being dragged

### updateLayout()

> **updateLayout**: () => `void`

Function to update the element's layout information

#### Returns

`void`
