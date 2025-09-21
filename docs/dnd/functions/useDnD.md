[**@mapples/dnd**](../README.md)

***

[@mapples/dnd](../globals.md) / useDnD

# Function: useDnD()

> **useDnD**\<`DragData`, `DropData`\>(): [`DnDContextType`](../interfaces/DnDContextType.md)\<`DragData`, `DropData`\>

Defined in: [hooks/useDnD.ts:15](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/hooks/useDnD.ts#L15)

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
