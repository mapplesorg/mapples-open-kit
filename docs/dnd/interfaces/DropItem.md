[**@mapples/dnd**](../README.md)

***

[@mapples/dnd](../globals.md) / DropItem

# Interface: DropItem\<T\>

Defined in: [types/index.ts:181](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L181)

Interface representing a drop item with layout and data information.

## Type Parameters

### T

`T`

The type of data associated with the drop item

## Properties

### canDrop?

> `optional` **canDrop**: `boolean`

Defined in: [types/index.ts:187](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L187)

Whether this item can accept drops

***

### children?

> `optional` **children**: [`DropTree`](../type-aliases/DropTree.md)\<`T`\>

Defined in: [types/index.ts:185](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L185)

Optional child drop items

***

### data?

> `optional` **data**: `T`

Defined in: [types/index.ts:189](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L189)

Optional data associated with this drop item

***

### layout

> **layout**: [`LayoutPosition`](../type-aliases/LayoutPosition.md)

Defined in: [types/index.ts:183](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L183)

The layout position and configuration
