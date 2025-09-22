[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/dnd](../README.md) / useDnD

# Function: useDnD()

> **useDnD**\<`DragData`, `DropData`\>(): [`DnDContextType`](../interfaces/DnDContextType.md)\<`DragData`, `DropData`\>

Defined in: [hooks/useDnD.ts:15](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/hooks/useDnD.ts#L15)

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
