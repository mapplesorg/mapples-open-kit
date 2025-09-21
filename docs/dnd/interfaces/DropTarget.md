[**@mapples/dnd**](../README.md)

***

[@mapples/dnd](../globals.md) / DropTarget

# Interface: DropTarget\<T\>

Defined in: [types/index.ts:215](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L215)

Interface representing a drop target with all its properties.

## Type Parameters

### T

`T`

The type of data associated with the drop target

## Properties

### canDrop?

> `optional` **canDrop**: `boolean`

Defined in: [types/index.ts:223](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L223)

Whether this target can accept drops

***

### children?

> `optional` **children**: [`DropTree`](../type-aliases/DropTree.md)\<`T`\>

Defined in: [types/index.ts:225](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L225)

Optional child drop targets

***

### data?

> `optional` **data**: `T`

Defined in: [types/index.ts:227](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L227)

Optional data associated with this drop target

***

### id

> **id**: `number`

Defined in: [types/index.ts:217](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L217)

Unique identifier for the drop target

***

### index

> **index**: `number`

Defined in: [types/index.ts:221](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L221)

Index position within the parent

***

### layout

> **layout**: [`LayoutPosition`](../type-aliases/LayoutPosition.md)

Defined in: [types/index.ts:219](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/dnd/src/types/index.ts#L219)

Layout position and configuration
