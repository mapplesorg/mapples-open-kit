[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [dnd/src](../README.md) / DropItem

# Interface: DropItem\<T\>

Defined in: [packages/@mapples/dnd/src/types/index.ts:181](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/dnd/src/types/index.ts#L181)

Interface representing a drop item with layout and data information.

## Type Parameters

### T

`T`

The type of data associated with the drop item

## Properties

### layout

> **layout**: [`LayoutPosition`](../type-aliases/LayoutPosition.md)

Defined in: [packages/@mapples/dnd/src/types/index.ts:183](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/dnd/src/types/index.ts#L183)

The layout position and configuration

***

### children?

> `optional` **children**: [`DropTree`](../type-aliases/DropTree.md)\<`T`\>

Defined in: [packages/@mapples/dnd/src/types/index.ts:185](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/dnd/src/types/index.ts#L185)

Optional child drop items

***

### canDrop?

> `optional` **canDrop**: `boolean`

Defined in: [packages/@mapples/dnd/src/types/index.ts:187](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/dnd/src/types/index.ts#L187)

Whether this item can accept drops

***

### data?

> `optional` **data**: `T`

Defined in: [packages/@mapples/dnd/src/types/index.ts:189](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/dnd/src/types/index.ts#L189)

Optional data associated with this drop item
