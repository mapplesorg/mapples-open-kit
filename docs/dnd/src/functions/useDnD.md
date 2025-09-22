[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [dnd/src](../README.md) / useDnD

# Function: useDnD()

> **useDnD**\<`DragData`, `DropData`\>(): [`DnDContextType`](../interfaces/DnDContextType.md)\<`DragData`, `DropData`\>

Defined in: [packages/@mapples/dnd/src/hooks/useDnD.ts:15](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/dnd/src/hooks/useDnD.ts#L15)

Hook to access the drag and drop context.
This hook provides access to the monitor, drag state, and shared values.

## Type Parameters

### DragData

`DragData` *extends* `object`

The type of data being dragged

### DropData

`DropData` *extends* `object` = `DragData`

The type of data for drop targets (defaults to DragData)

## Returns

[`DnDContextType`](../interfaces/DnDContextType.md)\<`DragData`, `DropData`\>

The drag and drop context with monitor and state
