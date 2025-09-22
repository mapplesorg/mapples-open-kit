[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [dnd/src](../README.md) / useDrop

# Function: useDrop()

> **useDrop**\<`DragData`, `DropData`\>(`ref`, `config?`, `data?`): `object`

Defined in: [packages/@mapples/dnd/src/hooks/useDrop.ts:24](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/dnd/src/hooks/useDrop.ts#L24)

Hook that makes a view a drop target within the drag and drop system.
This hook registers the view as a drop target and tracks drop state.

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

Reference to the view element that should be a drop target

### config?

[`DropTargetConfig`](../interfaces/DropTargetConfig.md)

Optional configuration for the drop target behavior

### data?

`DropData`

Optional data associated with this drop target

## Returns

Object containing drop state and utilities

### id

> **id**: `null` \| `number`

The unique ID of the drop element

### isOver

> **isOver**: `boolean`

Whether a drag is currently over this drop target

### dropTarget

> **dropTarget**: `null` \| [`DropTarget`](../interfaces/DropTarget.md)\<`DropData`\>

The current drop target information

### dropTargetIndex

> **dropTargetIndex**: `null` \| `number`

The index position within the drop target

### isDragging

> **isDragging**: `boolean`

Whether any drag operation is currently active

### updateLayout()

> **updateLayout**: () => `void`

Function to update the element's layout information

#### Returns

`void`
