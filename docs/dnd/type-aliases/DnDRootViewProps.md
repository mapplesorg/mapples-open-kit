[**@mapples/dnd**](../README.md)

***

[@mapples/dnd](../globals.md) / DnDRootViewProps

# Type Alias: DnDRootViewProps\<DragData, DropData\>

> **DnDRootViewProps**\<`DragData`, `DropData`\> = `PropsWithChildren`\<`ViewProps`\> & `object`

Defined in: [types/index.ts:115](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L115)

Props type for the root drag and drop view component.

## Type Declaration

### DragElement()?

> `optional` **DragElement**: \<`T`\>(`data`) => `ReactElement`

Optional custom drag element renderer

#### Type Parameters

##### T

`T`

#### Parameters

##### data

[`DragItem`](../interfaces/DragItem.md)\<`T`\>

#### Returns

`ReactElement`

### onDrop()?

> `optional` **onDrop**: (`event`, `item`) => `void`

Callback fired when a drop operation completes

#### Parameters

##### event

[`DnDEvent`](../interfaces/DnDEvent.md)\<`DragData`, `DropData`\>

##### item

[`DragItem`](../interfaces/DragItem.md)\<`DragData`\>

#### Returns

`void`

## Type Parameters

### DragData

`DragData` *extends* `object`

The type of data being dragged

### DropData

`DropData` *extends* `object` = `DragData`

The type of data for drop targets (defaults to DragData)
