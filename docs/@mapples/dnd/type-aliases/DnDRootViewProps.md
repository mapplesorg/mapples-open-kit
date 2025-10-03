[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/dnd](../README.md) / DnDRootViewProps

# Type Alias: DnDRootViewProps\<DragData, DropData\>

> **DnDRootViewProps**\<`DragData`, `DropData`\> = `PropsWithChildren`\<`ViewProps`\> & `object`

Defined in: [types/index.ts:117](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/types/index.ts#L117)

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
