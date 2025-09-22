[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/dnd](../README.md) / DropItem

# Interface: DropItem\<T\>

Defined in: [types/index.ts:183](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L183)

Interface representing a drop item with layout and data information.

## Type Parameters

### T

`T`

The type of data associated with the drop item

## Properties

### layout

> **layout**: [`LayoutPosition`](../type-aliases/LayoutPosition.md)

Defined in: [types/index.ts:185](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L185)

The layout position and configuration

***

### children?

> `optional` **children**: [`DropTree`](../type-aliases/DropTree.md)\<`T`\>

Defined in: [types/index.ts:187](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L187)

Optional child drop items

***

### canDrop?

> `optional` **canDrop**: `boolean`

Defined in: [types/index.ts:189](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L189)

Whether this item can accept drops

***

### data?

> `optional` **data**: `T`

Defined in: [types/index.ts:191](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L191)

Optional data associated with this drop item
