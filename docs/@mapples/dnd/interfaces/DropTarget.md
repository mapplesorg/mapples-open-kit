[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/dnd](../README.md) / DropTarget

# Interface: DropTarget\<T\>

Defined in: [types/index.ts:217](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L217)

Interface representing a drop target with all its properties.

## Type Parameters

### T

`T`

The type of data associated with the drop target

## Properties

### id

> **id**: `number`

Defined in: [types/index.ts:219](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L219)

Unique identifier for the drop target

***

### layout

> **layout**: [`LayoutPosition`](../type-aliases/LayoutPosition.md)

Defined in: [types/index.ts:221](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L221)

Layout position and configuration

***

### index

> **index**: `number`

Defined in: [types/index.ts:223](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L223)

Index position within the parent

***

### canDrop?

> `optional` **canDrop**: `boolean`

Defined in: [types/index.ts:225](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L225)

Whether this target can accept drops

***

### children?

> `optional` **children**: [`DropTree`](../type-aliases/DropTree.md)\<`T`\>

Defined in: [types/index.ts:227](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L227)

Optional child drop targets

***

### data?

> `optional` **data**: `T`

Defined in: [types/index.ts:229](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L229)

Optional data associated with this drop target
